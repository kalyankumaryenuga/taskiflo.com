import { createServer } from 'node:http'
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'

const port = Number(process.env.PORT ?? 8787)
const connectionStorePath = '.taskiflo/shopify-connections.json'
const pendingShopifyStates = new Map()
const pendingIntegrationStates = new Map()
loadEnvFile('.env')
loadEnvFile('.env.local')

function loadEnvFile(path) {
  if (!existsSync(path)) {
    return
  }

  const lines = readFileSync(path, 'utf8').split(/\r?\n/)
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) {
      continue
    }

    const [key, ...valueParts] = trimmed.split('=')
    if (!process.env[key]) {
      process.env[key] = valueParts.join('=')
    }
  }
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? '/', `http://${request.headers.host}`)

  if (request.method === 'OPTIONS') {
    sendJson(response, 204, {})
    return
  }

  if (request.method === 'GET' && url.pathname === '/health') {
    sendJson(response, 200, { ok: true })
    return
  }

  if (request.method === 'POST' && url.pathname === '/api/analyze-website') {
    try {
      const body = await readJson(request)
      const result = await analyzeWebsite(body)
      sendJson(response, 200, result)
    } catch (error) {
      sendJson(response, 500, { error: error instanceof Error ? error.message : 'Analysis failed.' })
    }
    return
  }

  if (request.method === 'POST' && url.pathname === '/api/engagement/reply') {
    try {
      const body = await readJson(request)
      const result = await generateEngagementReply(body)
      sendJson(response, 200, result)
    } catch (error) {
      sendJson(response, 500, { error: error instanceof Error ? error.message : 'Could not draft engagement reply.' })
    }
    return
  }

  if (request.method === 'GET' && url.pathname === '/api/shopify/products') {
    try {
      const result = await fetchShopifyProducts()
      sendJson(response, 200, result)
    } catch (error) {
      sendJson(response, 500, { error: error instanceof Error ? error.message : 'Could not import Shopify products.' })
    }
    return
  }

  if (request.method === 'GET' && url.pathname === '/api/shopify/connect') {
    try {
      const result = createShopifyAuthorizationUrl(url.searchParams.get('shop'))
      sendJson(response, 200, result)
    } catch (error) {
      sendJson(response, 400, { error: error instanceof Error ? error.message : 'Could not start Shopify connection.' })
    }
    return
  }

  if (request.method === 'GET' && url.pathname === '/api/integrations/connect') {
    try {
      const result = createIntegrationAuthorizationUrl(url.searchParams.get('provider'))
      sendJson(response, 200, result)
    } catch (error) {
      sendJson(response, 400, { error: error instanceof Error ? error.message : 'Could not start integration connection.' })
    }
    return
  }

  if (request.method === 'GET' && url.pathname.startsWith('/api/integrations/callback/')) {
    handleIntegrationCallback(url, response)
    return
  }

  if (request.method === 'GET' && url.pathname === '/api/shopify/callback') {
    await handleShopifyCallback(url, response)
    return
  }

  sendJson(response, 404, { error: 'Not found.' })
})

server.listen(port, '127.0.0.1', () => {
  console.log(`Taskiflo AI proxy listening on http://127.0.0.1:${port}`)
})

async function analyzeWebsite(body) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is missing. Add it to .env.local.')
  }

  const websiteUrl = String(body.websiteUrl ?? '').trim()
  const profileFields = Array.isArray(body.profileFields) ? body.profileFields : []
  const websiteText = await fetchWebsiteText(websiteUrl)
  const profileText = profileFields.map((field) => `${field.label}: ${field.value}`).join('\n')

  const openaiResponse = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? 'gpt-4.1-mini',
      input: [
        {
          role: 'system',
          content:
            'You are Taskiflo, an approval-first marketing assistant. Analyze a small business website and create safe, specific social drafts. Avoid fake discounts, medical claims, or unsupported promises. Do not return empty strings; use fewer list items when evidence is limited.',
        },
        {
          role: 'user',
          content: `Website URL: ${websiteUrl}\n\nKnown business profile:\n${profileText}\n\nWebsite text excerpt:\n${websiteText}`,
        },
      ],
      text: {
        format: {
          type: 'json_schema',
          name: 'taskiflo_website_analysis',
          strict: true,
          schema: {
            type: 'object',
            additionalProperties: false,
            required: ['brandTone', 'productsDetected', 'customerIntent', 'drafts'],
            properties: {
              brandTone: {
                type: 'array',
                minItems: 1,
                maxItems: 4,
                items: { type: 'string' },
              },
              productsDetected: {
                type: 'array',
                minItems: 1,
                maxItems: 4,
                items: { type: 'string' },
              },
              customerIntent: {
                type: 'array',
                minItems: 1,
                maxItems: 4,
                items: { type: 'string' },
              },
              drafts: {
                type: 'array',
                minItems: 2,
                maxItems: 2,
                items: {
                  type: 'object',
                  additionalProperties: false,
                  required: ['type', 'source', 'title', 'preview', 'status'],
                  properties: {
                    type: { type: 'string', enum: ['Social post'] },
                    source: { type: 'string', enum: ['Instagram', 'Facebook'] },
                    title: { type: 'string' },
                    preview: { type: 'string' },
                    status: { type: 'string', enum: ['Needs approval'] },
                  },
                },
              },
            },
          },
        },
      },
    }),
  })

  if (!openaiResponse.ok) {
    const errorText = await openaiResponse.text()
    throw new Error(`OpenAI request failed (${openaiResponse.status}): ${errorText.slice(0, 240)}`)
  }

  const data = await openaiResponse.json()
  const outputText = data.output_text ?? data.output?.flatMap((item) => item.content ?? []).find((item) => item.type === 'output_text')?.text
  if (!outputText) {
    throw new Error('OpenAI response did not include structured output.')
  }

  return JSON.parse(outputText)
}

function createIntegrationAuthorizationUrl(providerInput) {
  const provider = normalizeProvider(providerInput)
  if (!provider) {
    throw new Error('Choose Gmail, Instagram, Facebook / Meta, or TikTok.')
  }

  const appUrl = getAppUrl()
  const state = randomBytes(16).toString('hex')
  pendingIntegrationStates.set(state, { provider, createdAt: Date.now() })

  if (provider === 'gmail') {
    const clientId = process.env.GOOGLE_CLIENT_ID
    if (!clientId) {
      throw new Error('Google OAuth is not configured yet. Add GOOGLE_CLIENT_ID to .env.local.')
    }

    const authorizationUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
    authorizationUrl.searchParams.set('client_id', clientId)
    authorizationUrl.searchParams.set('redirect_uri', `${appUrl}/api/integrations/callback/gmail`)
    authorizationUrl.searchParams.set('response_type', 'code')
    authorizationUrl.searchParams.set('scope', process.env.GOOGLE_SCOPES ?? 'https://www.googleapis.com/auth/gmail.compose https://www.googleapis.com/auth/gmail.send')
    authorizationUrl.searchParams.set('access_type', 'offline')
    authorizationUrl.searchParams.set('prompt', 'consent')
    authorizationUrl.searchParams.set('state', state)
    return { provider, authorizationUrl: authorizationUrl.toString() }
  }

  if (provider === 'meta') {
    const clientId = process.env.META_CLIENT_ID
    if (!clientId) {
      throw new Error('Meta OAuth is not configured yet. Add META_CLIENT_ID to .env.local.')
    }

    const apiVersion = process.env.META_API_VERSION ?? 'v22.0'
    const authorizationUrl = new URL(`https://www.facebook.com/${apiVersion}/dialog/oauth`)
    authorizationUrl.searchParams.set('client_id', clientId)
    authorizationUrl.searchParams.set('redirect_uri', `${appUrl}/api/integrations/callback/meta`)
    authorizationUrl.searchParams.set('response_type', 'code')
    authorizationUrl.searchParams.set('scope', process.env.META_SCOPES ?? 'pages_show_list,pages_read_engagement,pages_manage_posts,instagram_basic,instagram_content_publish')
    authorizationUrl.searchParams.set('state', state)
    return { provider, authorizationUrl: authorizationUrl.toString() }
  }

  if (provider === 'tiktok') {
    const clientKey = process.env.TIKTOK_CLIENT_KEY
    if (!clientKey) {
      throw new Error('TikTok OAuth is not configured yet. Add TIKTOK_CLIENT_KEY to .env.local.')
    }

    const authorizationUrl = new URL('https://www.tiktok.com/v2/auth/authorize/')
    authorizationUrl.searchParams.set('client_key', clientKey)
    authorizationUrl.searchParams.set('redirect_uri', `${appUrl}/api/integrations/callback/tiktok`)
    authorizationUrl.searchParams.set('response_type', 'code')
    authorizationUrl.searchParams.set('scope', process.env.TIKTOK_SCOPES ?? 'user.info.basic,video.upload,video.publish')
    authorizationUrl.searchParams.set('state', state)
    return { provider, authorizationUrl: authorizationUrl.toString() }
  }

  throw new Error('This integration does not use a login redirect yet.')
}

function handleIntegrationCallback(url, response) {
  const provider = url.pathname.split('/').at(-1) ?? 'integration'
  const frontendUrl = process.env.MARKETPILOT_FRONTEND_URL ?? process.env.TASKIFLO_FRONTEND_URL ?? 'http://127.0.0.1:5173'
  const state = url.searchParams.get('state')
  const pending = state ? pendingIntegrationStates.get(state) : null

  if (pending) {
    pendingIntegrationStates.delete(state)
  }

  const status = url.searchParams.has('error') ? 'error' : 'connected'
  const message = url.searchParams.get('error_description') ?? url.searchParams.get('error') ?? `${provider} connected. Token exchange is the next backend step.`
  redirect(response, `${frontendUrl}/?integration=${encodeURIComponent(provider)}&status=${status}&message=${encodeURIComponent(message)}`)
}

function normalizeProvider(value) {
  const provider = String(value ?? '').toLowerCase().trim()
  if (provider === 'gmail' || provider === 'google') {
    return 'gmail'
  }

  if (provider === 'instagram' || provider === 'facebook' || provider === 'facebook / meta' || provider === 'meta') {
    return 'meta'
  }

  if (provider === 'tiktok') {
    return 'tiktok'
  }

  return ''
}

function getAppUrl() {
  return (process.env.TASKIFLO_APP_URL ?? process.env.SHOPIFY_APP_URL ?? `http://127.0.0.1:${port}`).replace(/\/$/, '')
}

async function generateEngagementReply(body) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is missing. Add it to .env.local.')
  }

  const item = body.item ?? {}
  const profileFields = Array.isArray(body.profileFields) ? body.profileFields : []
  const profileText = profileFields.map((field) => `${field.label}: ${field.value}`).join('\n')

  const openaiResponse = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? 'gpt-4.1-mini',
      input: [
        {
          role: 'system',
          content:
            'You are Taskiflo, an approval-first customer engagement assistant. Draft concise, warm replies to comments and DMs. Never invent policies, discounts, shipping dates, stock, medical claims, or private customer details. If the answer needs confirmation, say that clearly.',
        },
        {
          role: 'user',
          content: `Business profile:\n${profileText}\n\nSource: ${item.source}\nType: ${item.kind}\nCustomer: ${item.customerName}\nContext: ${item.contextLabel}\nIncoming text: ${item.inboundText}`,
        },
      ],
      text: {
        format: {
          type: 'json_schema',
          name: 'taskiflo_engagement_reply',
          strict: true,
          schema: {
            type: 'object',
            additionalProperties: false,
            required: ['type', 'source', 'title', 'preview', 'status', 'customerName', 'inboundText', 'contextLabel'],
            properties: {
              type: { type: 'string' },
              source: { type: 'string' },
              title: { type: 'string' },
              preview: { type: 'string' },
              status: { type: 'string', enum: ['Needs approval'] },
              customerName: { type: 'string' },
              inboundText: { type: 'string' },
              contextLabel: { type: 'string' },
            },
          },
        },
      },
    }),
  })

  if (!openaiResponse.ok) {
    const errorText = await openaiResponse.text()
    throw new Error(`OpenAI request failed (${openaiResponse.status}): ${errorText.slice(0, 240)}`)
  }

  const data = await openaiResponse.json()
  const outputText = data.output_text ?? data.output?.flatMap((entry) => entry.content ?? []).find((entry) => entry.type === 'output_text')?.text
  if (!outputText) {
    throw new Error('OpenAI response did not include structured output.')
  }

  const draft = JSON.parse(outputText)
  return {
    ...draft,
    type: draft.type || `${item.kind ?? 'Message'} reply`,
    source: draft.source || item.source || 'Instagram',
    title: draft.title || `Reply to ${item.customerName ?? 'customer'}`,
    status: 'Needs approval',
    customerName: draft.customerName || item.customerName,
    inboundText: draft.inboundText || item.inboundText,
    contextLabel: draft.contextLabel || item.contextLabel,
  }
}

async function fetchShopifyProducts() {
  const connection = getCurrentShopifyConnection()
  const storeDomain = connection?.shop ?? normalizeShopifyDomain(process.env.SHOPIFY_STORE_DOMAIN)
  const accessToken = connection?.accessToken ?? process.env.SHOPIFY_ADMIN_ACCESS_TOKEN
  const apiVersion = process.env.SHOPIFY_API_VERSION ?? '2026-04'

  if (!storeDomain || !accessToken) {
    return {
      configured: false,
      products: [],
      message: getShopifyOAuthConfig().configured
        ? 'Click Connect Shopify, approve the app in Shopify, then import products.'
        : 'Add Shopify app credentials once so clients can connect by logging in with Shopify.',
    }
  }

  const shopifyResponse = await fetch(`https://${storeDomain}/admin/api/${apiVersion}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': accessToken,
    },
    body: JSON.stringify({
      query: `#graphql
        query TaskifloProducts {
          products(first: 12, sortKey: UPDATED_AT, reverse: true) {
            nodes {
              id
              title
              handle
              status
              totalInventory
              onlineStoreUrl
              featuredImage {
                url
              }
              priceRangeV2 {
                minVariantPrice {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      `,
    }),
  })

  if (!shopifyResponse.ok) {
    const errorText = await shopifyResponse.text()
    throw new Error(`Shopify request failed (${shopifyResponse.status}): ${errorText.slice(0, 240)}`)
  }

  const payload = await shopifyResponse.json()
  if (payload.errors?.length) {
    throw new Error(payload.errors.map((error) => error.message).join(' '))
  }

  const products = payload.data.products.nodes.map((product) => {
    const price = product.priceRangeV2?.minVariantPrice
    return {
      id: product.id,
      name: product.title,
      status: formatShopifyStatus(product.status, product.totalInventory),
      price: price ? new Intl.NumberFormat('en', { style: 'currency', currency: price.currencyCode }).format(Number(price.amount)) : 'No price',
      angle: product.onlineStoreUrl ? `Product page: ${product.onlineStoreUrl}` : `Handle: ${product.handle}`,
      lastPosted: 'Imported from Shopify',
      imageUrl: product.featuredImage?.url ?? null,
    }
  })

  return {
    configured: true,
    products,
    message: `Imported ${products.length} Shopify products.`,
  }
}

function createShopifyAuthorizationUrl(shopInput) {
  const shop = normalizeShopifyDomain(shopInput)
  if (!shop || !shop.endsWith('.myshopify.com')) {
    throw new Error('Enter a valid Shopify store domain like example-store.myshopify.com.')
  }

  const config = getShopifyOAuthConfig()
  if (!config.configured) {
    throw new Error('Shopify app credentials are missing. Add SHOPIFY_CLIENT_ID and SHOPIFY_CLIENT_SECRET first.')
  }

  const state = randomBytes(16).toString('hex')
  pendingShopifyStates.set(state, { shop, createdAt: Date.now() })

  const authorizationUrl = new URL(`https://${shop}/admin/oauth/authorize`)
  authorizationUrl.searchParams.set('client_id', config.clientId)
  authorizationUrl.searchParams.set('scope', config.scopes)
  authorizationUrl.searchParams.set('redirect_uri', config.redirectUri)
  authorizationUrl.searchParams.set('state', state)

  return {
    authorizationUrl: authorizationUrl.toString(),
    shop,
  }
}

async function handleShopifyCallback(url, response) {
  const shop = normalizeShopifyDomain(url.searchParams.get('shop'))
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const frontendUrl = process.env.MARKETPILOT_FRONTEND_URL ?? 'http://127.0.0.1:5173'

  try {
    const pending = state ? pendingShopifyStates.get(state) : null
    if (!pending || pending.shop !== shop || Date.now() - pending.createdAt > 10 * 60 * 1000) {
      throw new Error('Shopify connection expired. Start again from Taskiflo.')
    }

    pendingShopifyStates.delete(state)
    verifyShopifyCallback(url)

    if (!code) {
      throw new Error('Shopify did not return an authorization code.')
    }

    const config = getShopifyOAuthConfig()
    const tokenResponse = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        code,
      }),
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      throw new Error(`Shopify token exchange failed (${tokenResponse.status}): ${errorText.slice(0, 240)}`)
    }

    const tokenPayload = await tokenResponse.json()
    saveShopifyConnection({
      shop,
      accessToken: tokenPayload.access_token,
      scopes: tokenPayload.scope,
      connectedAt: new Date().toISOString(),
    })

    redirect(response, `${frontendUrl}/?shopify=connected`)
  } catch (error) {
    const message = encodeURIComponent(error instanceof Error ? error.message : 'Shopify connection failed.')
    redirect(response, `${frontendUrl}/?shopify=error&message=${message}`)
  }
}

function getShopifyOAuthConfig() {
  const appUrl = process.env.SHOPIFY_APP_URL ?? getAppUrl()
  const clientId = process.env.SHOPIFY_CLIENT_ID
  const clientSecret = process.env.SHOPIFY_CLIENT_SECRET

  return {
    appUrl,
    clientId,
    clientSecret,
    scopes: process.env.SHOPIFY_SCOPES ?? 'read_products,read_inventory',
    redirectUri: `${appUrl.replace(/\/$/, '')}/api/shopify/callback`,
    configured: Boolean(clientId && clientSecret),
  }
}

function verifyShopifyCallback(url) {
  const hmac = url.searchParams.get('hmac')
  const secret = process.env.SHOPIFY_CLIENT_SECRET
  if (!hmac || !secret) {
    throw new Error('Shopify callback signature is missing.')
  }

  const message = [...url.searchParams.entries()]
    .filter(([key]) => key !== 'hmac' && key !== 'signature')
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join('&')

  const digest = createHmac('sha256', secret).update(message).digest('hex')
  const expected = Buffer.from(digest, 'hex')
  const actual = Buffer.from(hmac, 'hex')

  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    throw new Error('Shopify callback signature is invalid.')
  }
}

function getCurrentShopifyConnection() {
  const store = readShopifyConnectionStore()
  const connections = Object.values(store)
  return connections.at(-1) ?? null
}

function saveShopifyConnection(connection) {
  const store = readShopifyConnectionStore()
  store[connection.shop] = connection
  mkdirSync('.taskiflo', { recursive: true })
  writeFileSync(connectionStorePath, JSON.stringify(store, null, 2))
}

function readShopifyConnectionStore() {
  if (!existsSync(connectionStorePath)) {
    return {}
  }

  try {
    return JSON.parse(readFileSync(connectionStorePath, 'utf8'))
  } catch {
    return {}
  }
}

function normalizeShopifyDomain(value) {
  if (!value) {
    return ''
  }

  return String(value)
    .trim()
    .replace(/^https?:\/\//, '')
    .replace(/\/.*$/, '')
}

function formatShopifyStatus(status, totalInventory) {
  if (status === 'DRAFT') {
    return 'Draft'
  }

  if (status === 'ARCHIVED') {
    return 'Archived'
  }

  if (typeof totalInventory === 'number' && totalInventory <= 0) {
    return 'Out of stock'
  }

  return 'Ready'
}

async function fetchWebsiteText(websiteUrl) {
  if (!websiteUrl) {
    return 'No website URL provided.'
  }

  try {
    const response = await fetch(websiteUrl, {
      headers: {
        'User-Agent': 'Taskiflo local development analyzer',
      },
      redirect: 'follow',
    })

    if (!response.ok) {
      return `Could not fetch website. HTTP status ${response.status}.`
    }

    const html = await response.text()
    return html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 12000)
  } catch (error) {
    return `Could not fetch website: ${error instanceof Error ? error.message : 'unknown error'}.`
  }
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    let raw = ''
    request.on('data', (chunk) => {
      raw += chunk
      if (raw.length > 1_000_000) {
        request.destroy()
        reject(new Error('Request body is too large.'))
      }
    })
    request.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {})
      } catch {
        reject(new Error('Invalid JSON body.'))
      }
    })
    request.on('error', reject)
  })
}

function sendJson(response, status, payload) {
  response.writeHead(status, {
    'Access-Control-Allow-Origin': 'http://127.0.0.1:5173',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Content-Type': 'application/json',
  })

  if (status === 204) {
    response.end()
    return
  }

  response.end(JSON.stringify(payload))
}

function redirect(response, location) {
  response.writeHead(302, { Location: location })
  response.end()
}
