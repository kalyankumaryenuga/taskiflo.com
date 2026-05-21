import { isSupabaseConfigured, supabase } from './supabase'
import type { AppSnapshot, ApprovalItem, ProfileField } from './types'

const storageKeys = {
  websiteUrl: 'taskiflo.websiteUrl',
  approvalRequired: 'taskiflo.approvalRequired',
  campaignMode: 'taskiflo.campaignMode',
  profileFields: 'taskiflo.profileFields',
  approvals: 'taskiflo.approvals',
  connections: 'taskiflo.connections',
}

const legacyStorageKeys = {
  websiteUrl: 'marketpilot.websiteUrl',
  approvalRequired: 'marketpilot.approvalRequired',
  campaignMode: 'marketpilot.campaignMode',
  profileFields: 'marketpilot.profileFields',
  approvals: 'marketpilot.approvals',
  connections: 'marketpilot.connections',
}

export function readLocalSnapshot(defaults: AppSnapshot): AppSnapshot {
  return {
    websiteUrl: readLocalValue(storageKeys.websiteUrl, defaults.websiteUrl, legacyStorageKeys.websiteUrl),
    approvalRequired: readLocalValue(storageKeys.approvalRequired, defaults.approvalRequired, legacyStorageKeys.approvalRequired),
    campaignMode: readLocalValue(storageKeys.campaignMode, defaults.campaignMode, legacyStorageKeys.campaignMode),
    profileFields: readLocalValue(storageKeys.profileFields, defaults.profileFields, legacyStorageKeys.profileFields),
    approvals: readLocalValue(storageKeys.approvals, defaults.approvals, legacyStorageKeys.approvals),
    connections: readLocalValue(storageKeys.connections, defaults.connections, legacyStorageKeys.connections),
  }
}

export function writeLocalSnapshot(snapshot: AppSnapshot) {
  writeLocalValue(storageKeys.websiteUrl, snapshot.websiteUrl)
  writeLocalValue(storageKeys.approvalRequired, snapshot.approvalRequired)
  writeLocalValue(storageKeys.campaignMode, snapshot.campaignMode)
  writeLocalValue(storageKeys.profileFields, snapshot.profileFields)
  writeLocalValue(storageKeys.approvals, snapshot.approvals)
  writeLocalValue(storageKeys.connections, snapshot.connections)
}

export function resetLocalSnapshot() {
  Object.values(storageKeys).forEach((key) => window.localStorage.removeItem(key))
  Object.values(legacyStorageKeys).forEach((key) => window.localStorage.removeItem(key))
}

export async function getPersistenceMode() {
  if (!isSupabaseConfigured || !supabase) {
    return 'Local demo storage'
  }

  const { data } = await supabase.auth.getSession()
  return data.session ? 'Supabase database' : 'Supabase configured, demo session active'
}

export async function syncSnapshotToSupabase(snapshot: AppSnapshot) {
  if (!isSupabaseConfigured || !supabase) {
    return {
      mode: 'demo' as const,
      message: 'Demo data is saved locally. Add Supabase env keys to sync to the database.',
    }
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return {
      mode: 'demo' as const,
      message: 'Supabase is configured, but no signed-in user is available yet.',
    }
  }

  const businessPayload = {
    owner_id: user.id,
    name: 'Taskiflo Demo Business',
    ...profileFieldsToBusinessUpdate(snapshot.profileFields, snapshot.websiteUrl),
  }

  const { data: existingBusiness, error: lookupError } = await supabase
    .from('businesses')
    .select('id')
    .eq('owner_id', user.id)
    .maybeSingle()

  if (lookupError) {
    throw new Error(lookupError.message)
  }

  const { data: business, error: businessError } = existingBusiness
    ? await supabase.from('businesses').update(businessPayload).eq('id', existingBusiness.id).select('id').single()
    : await supabase.from('businesses').insert(businessPayload).select('id').single()

  if (businessError || !business) {
    throw new Error(businessError?.message ?? 'Could not save business profile.')
  }

  const draftRows = snapshot.approvals.map((approval) => approvalToDraftInsert(approval, business.id))
  if (draftRows.length > 0) {
    const { error: draftsError } = await supabase.from('content_drafts').insert(draftRows)
    if (draftsError) {
      throw new Error(draftsError.message)
    }
  }

  return {
    mode: 'supabase' as const,
    message: `Synced business profile and ${draftRows.length} drafts to Supabase.`,
  }
}

export function approvalToDraftInsert(approval: ApprovalItem, businessId: string) {
  return {
    business_id: businessId,
    content_type: approval.type === 'Email reply' ? 'email_reply' : 'social_post',
    platform: approval.source.toLowerCase().includes('gmail') ? 'gmail' : approval.source.toLowerCase().includes('facebook') ? 'facebook' : 'instagram',
    title: approval.title,
    body: approval.preview,
    status: normalizeDraftStatus(approval.status),
    approved_at: approval.approvedAt ?? null,
    scheduled_at: approval.scheduledAt ?? null,
    published_at: approval.publishedAt ?? null,
  }
}

export function profileFieldsToBusinessUpdate(fields: ProfileField[], websiteUrl: string) {
  return {
    website_url: websiteUrl,
    operating_location: findField(fields, 'Operating location'),
    marketing_regions: findField(fields, 'Marketing regions'),
    target_audience: findField(fields, 'Target audience'),
    main_offer: findField(fields, 'Main offer'),
    brand_voice: findField(fields, 'Brand voice'),
    content_rules: findField(fields, 'Content rules'),
    updated_at: new Date().toISOString(),
  }
}

function readLocalValue<T>(key: string, fallback: T, legacyKey?: string) {
  const stored = window.localStorage.getItem(key) ?? (legacyKey ? window.localStorage.getItem(legacyKey) : null)
  if (!stored) {
    return fallback
  }

  try {
    return JSON.parse(stored) as T
  } catch {
    return fallback
  }
}

function writeLocalValue<T>(key: string, value: T) {
  window.localStorage.setItem(key, JSON.stringify(value))
}

function findField(fields: ProfileField[], label: string) {
  return fields.find((field) => field.label === label)?.value ?? null
}

function normalizeDraftStatus(status: string) {
  if (status === 'Approved') {
    return 'approved'
  }

  if (status === 'Scheduled draft') {
    return 'scheduled'
  }

  if (status === 'Scheduled' || status === 'Ready to send') {
    return 'scheduled'
  }

  if (status === 'Posted') {
    return 'posted'
  }

  if (status === 'Sent') {
    return 'sent'
  }

  return 'needs_approval'
}
