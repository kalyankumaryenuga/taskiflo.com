import React from 'react'
import { createRoot } from 'react-dom/client'
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Bot,
  CalendarCheck,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileText,
  Globe2,
  HelpCircle,
  Inbox,
  LockKeyhole,
  Mail,
  MessageCircle,
  Radar,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
  Trash2,
  Wand2,
  Zap,
} from 'lucide-react'
import './styles.css'

type Route = 'home' | 'privacy' | 'terms' | 'data-deletion' | 'support' | 'faq' | 'pricing' | 'app-store-assets'

const siteUrl = 'https://taskiflo.com'
const fallbackUrl = 'https://taskiflo.vercel.app'
const supportEmail = 'support@taskiflo.com'

const submissionValues = [
  ['Privacy policy URL', `${siteUrl}/privacy`],
  ['Terms of Service URL', `${siteUrl}/terms`],
  ['Data deletion URL', `${siteUrl}/data-deletion`],
  ['Support email', supportEmail],
  ['Developer website', siteUrl],
  ['FAQ URL', `${siteUrl}/faq`],
  ['Pricing URL', `${siteUrl}/pricing`],
  ['App card subtitle', 'Approval-first AI marketing for Shopify stores'],
  ['Search terms', 'marketing automation, social media, approval workflow, content calendar, AI marketing'],
]

const workflowCards = [
  {
    title: '1. Onboarding and business analysis',
    trigger: 'Owner signs up and submits the business website URL.',
    steps: ['Crawl website', 'Identify products and services', 'Learn brand tone', 'Create workspace memory'],
    output: 'A dedicated AI context workspace for the business.',
    mode: 'Setup workflow',
  },
  {
    title: '2. Gmail AI automation',
    trigger: 'A customer, supplier, or partner email arrives.',
    steps: ['Classify email', 'Read business context', 'Draft reply', 'Approve or auto-send'],
    output: 'Context-aware Gmail replies that improve as Taskiflo learns patterns.',
    mode: 'Approval or automation',
  },
  {
    title: '3. Shopify order management',
    trigger: 'A customer asks about an order through email, Instagram, or Facebook.',
    steps: ['Extract order ID', 'Look up Shopify order', 'Fetch tracking', 'Generate accurate reply'],
    output: 'Fast order-status answers using real Shopify data.',
    mode: 'Customer support',
  },
  {
    title: '4. Instagram and Facebook automation',
    trigger: 'A comment, DM, product question, buying intent, or complaint appears.',
    steps: ['Understand message', 'Fetch product context', 'Create response', 'Approve or reply'],
    output: 'Social replies, product links, comment responses, and recommended products.',
    mode: 'Social inbox',
  },
  {
    title: '5. AI social media content',
    trigger: 'A Shopify product, campaign, or content opportunity needs promotion.',
    steps: ['Analyse product', 'Generate captions', 'Adapt per platform', 'Schedule best timing'],
    output: 'Instagram and Facebook content with different captions, CTAs, hashtags, and timing logic.',
    mode: 'Content engine',
  },
  {
    title: '6. Full business automation',
    trigger: 'The owner trusts the workflow and enables higher automation.',
    steps: ['Monitor channels', 'Auto draft', 'Auto action where allowed', 'Supervisor review'],
    output: 'Repetitive marketing and customer-service tasks run with the owner supervising.',
    mode: 'Supervisor mode',
  },
  {
    title: '7. Future TikTok automation',
    trigger: 'A product can be promoted through short-form video.',
    steps: ['Import product', 'Generate video idea', 'Create captions', 'Schedule TikTok post'],
    output: 'Planned omnichannel short-form automation for product showcases and trends.',
    mode: 'Future channel',
  },
]

const capabilityRows = [
  ['Website analysis', 'Business category, products, services, brand tone, content style', 'Workspace memory'],
  ['Gmail', 'Customer inquiries, order emails, collaborations, business communications', 'Draft reply or auto-send'],
  ['Shopify orders', 'Order number, customer details, delivery status, tracking data', 'Accurate support reply'],
  ['Instagram + Facebook', 'DMs, comments, product questions, complaints, buying intent', 'Reply, product link, recommendation'],
  ['Social content', 'Product data, audience logic, platform format, best posting time', 'Scheduled post draft or publish action'],
  ['Automation mode', 'Confidence level and owner rules', 'AI employee with supervisor control'],
]

const workflowOverview = [
  ['Connect', 'The owner connects the store, website, inbox, and social channels.'],
  ['Understand', 'Taskiflo learns products, brand tone, customer context, and business rules.'],
  ['Control', 'AI prepares the work, safety checks it, and waits for approval before anything goes out.'],
]

const launchPlanFeatures = [
  'Website and store signal analysis',
  'Approval inbox for AI-generated drafts',
  'Gmail, social, and Shopify campaign draft workflows',
  'Content calendar and scheduling handoff',
  'Safety checks for stock, delivery, price, offer, and policy claims',
  'Activity history for approvals, edits, schedules, sends, and publishes',
]

const pricingWorkflowItems = [
  ['Setup', 'Create a workspace, add business context, and connect approved channels.'],
  ['Drafting', 'Taskiflo prepares replies, posts, product campaigns, and content calendar ideas.'],
  ['Approval', 'The owner reviews each draft, confirms safety checks, and decides what moves forward.'],
  ['Tracking', 'Calendar and activity history show what was approved, scheduled, sent, or blocked.'],
]

function App() {
  const route = getRoute()

  if (route === 'privacy') return <LegalPage title="Privacy Policy" icon={ShieldCheck} kind="privacy" />
  if (route === 'terms') return <LegalPage title="Terms of Service" icon={FileText} kind="terms" />
  if (route === 'data-deletion') return <DeletionPage />
  if (route === 'support') return <SupportPage />
  if (route === 'faq') return <FaqPage />
  if (route === 'pricing') return <PricingPage />
  if (route === 'app-store-assets') return <AssetsPage />
  return <HomePage />
}

function HomePage() {
  const [activeWorkflowIndex, setActiveWorkflowIndex] = React.useState(0)
  const activeWorkflow = workflowCards[activeWorkflowIndex]
  const showPreviousWorkflow = () => setActiveWorkflowIndex((current) => (current === 0 ? workflowCards.length - 1 : current - 1))
  const showNextWorkflow = () => setActiveWorkflowIndex((current) => (current === workflowCards.length - 1 ? 0 : current + 1))

  return (
    <main>
      <Header />
      <section className="hero">
        <div className="hero-copy">
          <h1>Taskiflo</h1>
          <p className="hero-lede">
            Approval-first AI marketing automation for Shopify stores. Taskiflo drafts posts, customer replies, and product campaigns, then keeps every action locked until the owner approves it.
          </p>
          <div className="hero-actions">
            <a className="primary-button" href="#what-we-do">
              Understand Taskiflo
              <ArrowRight size={18} />
            </a>
            <a className="ghost-button" href="/app-store-assets">
              Review submission assets
              <FileText size={18} />
            </a>
          </div>
          <div className="signal-strip" aria-label="Taskiflo operating principles">
            <span>Drafts, not surprises</span>
            <span>Owner approval required</span>
            <span>Built for Shopify workflows</span>
          </div>
        </div>
        <CommandPreview />
      </section>

      <section className="section" id="what-we-do">
        <div className="section-heading">
          <h2>What Taskiflo does</h2>
          <p>Taskiflo is a marketing control center for small Shopify stores that need help staying consistent without giving AI permission to act on its own.</p>
        </div>
        <div className="explain-grid">
          <Feature icon={Radar} title="Detects work" text="Reads store, website, product, and customer signals that may need a reply, post, or campaign." />
          <Feature icon={Wand2} title="Drafts content" text="Creates Gmail replies, Instagram and Facebook posts, Shopify product campaigns, and content calendar ideas." />
          <Feature icon={ShieldCheck} title="Blocks risk" text="Flags sensitive claims like delivery timing, stock, pricing, discounts, policy wording, and unsafe promises." />
          <Feature icon={CheckCircle2} title="Waits for approval" text="Every draft sits in an approval queue until the merchant edits, approves, schedules, sends, or publishes it." />
        </div>
      </section>

      <section className="section split" id="workflow">
        <div>
          <h2>How the workflow works</h2>
          <p>
            A merchant connects channels, Taskiflo prepares safe drafts, the owner reviews them, and only approved work moves into the calendar or connected platforms.
          </p>
        </div>
        <div className="timeline">
          {[
            ['1', 'Connect store and channels', 'Shopify, Gmail, Instagram, Facebook, and reporting exports.'],
            ['2', 'AI drafts the work', 'Product launches, customer replies, captions, and campaign ideas.'],
            ['3', 'Safety checks run', 'Risky promises are flagged before the owner can approve.'],
            ['4', 'Owner approves', 'The merchant edits, approves, schedules, or blocks the draft.'],
            ['5', 'Taskiflo tracks history', 'Calendar, analytics, and activity logs keep the workflow accountable.'],
          ].map(([step, title, text]) => (
            <article className="timeline-row" key={step}>
              <span>{step}</span>
              <div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section workflow-architecture" id="architecture">
        <div className="section-heading">
          <h2>Detailed workflow architecture</h2>
          <p>
            Taskiflo works like an AI operations assistant for a Shopify business. Each workflow starts from a real store signal, turns it into a safe draft or action, and keeps the owner in control.
          </p>
        </div>
        <div className="workflow-overview" aria-label="Taskiflo workflow overview">
          {workflowOverview.map(([label, text], index) => (
            <article key={label}>
              <span>{index + 1}</span>
              <div>
                <h3>{label}</h3>
                <p>{text}</p>
              </div>
            </article>
          ))}
        </div>
        <div className="workflow-slider" aria-label="Detailed workflow slides">
          <div className="workflow-slide-tabs" role="tablist" aria-label="Choose a Taskiflo workflow">
            {workflowCards.map((workflow, index) => (
              <button
                aria-controls="workflow-slide-panel"
                aria-selected={activeWorkflowIndex === index}
                className={activeWorkflowIndex === index ? 'active' : ''}
                key={workflow.title}
                onClick={() => setActiveWorkflowIndex(index)}
                role="tab"
                type="button"
              >
                <span>{index + 1}</span>
                {workflow.mode}
              </button>
            ))}
          </div>

          <article className="workflow-detail-card workflow-slide-card" id="workflow-slide-panel" role="tabpanel">
            <div className="workflow-slide-meta">
              <span>{activeWorkflowIndex + 1} of {workflowCards.length}</span>
              <strong>{activeWorkflow.mode}</strong>
            </div>
            <div className="workflow-slide-actions">
              <button type="button" onClick={showPreviousWorkflow}>
                <ChevronLeft size={18} />
                Previous
              </button>
              <button type="button" onClick={showNextWorkflow}>
                Next workflow
                <ChevronRight size={18} />
              </button>
            </div>
            <div className="workflow-slide-layout">
              <div className="workflow-slide-copy">
                <div className="workflow-detail-head">
                  <h3>{activeWorkflow.title}</h3>
                  <span>{activeWorkflow.mode}</span>
                </div>
                <div className="workflow-trigger">
                  <strong>What starts it</strong>
                  <p className="trigger-copy">{activeWorkflow.trigger}</p>
                </div>
                <strong className="workflow-label">What Taskiflo does</strong>
                <div className="mini-flow" aria-label={`${activeWorkflow.title} steps`}>
                  {activeWorkflow.steps.map((step, index) => (
                    <span key={step}>
                      <small>{index + 1}</small>
                      {step}
                    </span>
                  ))}
                </div>
              </div>
              <div className="workflow-output">
                <strong>Business result</strong>
                <p className="output-copy">{activeWorkflow.output}</p>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section className="section split automation-map">
        <div>
          <h2>How Taskiflo actually works behind the scenes</h2>
          <p>
            Taskiflo uses the same operating loop across every channel: observe the signal, understand the business context, generate the safest next action, ask for approval when required, and keep a history of what happened.
          </p>
        </div>
        <div className="loop-diagram" aria-label="Taskiflo operating loop">
          {[
            ['01', 'Observe', 'Email, order, DM, comment, product, or website signal'],
            ['02', 'Understand', 'AI reads business memory, product data, and conversation context'],
            ['03', 'Create', 'Draft reply, post, caption, product link, or campaign plan'],
            ['04', 'Control', 'Owner approves manually or enables controlled automation'],
            ['05', 'Learn', 'Taskiflo records history and improves future drafts'],
          ].map(([number, label, text]) => (
            <article key={label}>
              <span>{number}</span>
              <h3>{label}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <h2>What we provide by workflow</h2>
          <p>This matrix makes the product promise concrete: each channel has a signal, an AI decision layer, and a practical output for the business owner.</p>
        </div>
        <div className="capability-table" role="table" aria-label="Taskiflo workflow capability matrix">
          <div className="capability-row header" role="row">
            <span role="columnheader">Workflow</span>
            <span role="columnheader">Taskiflo analyses</span>
            <span role="columnheader">Business output</span>
          </div>
          {capabilityRows.map(([workflow, analyses, output]) => (
            <div className="capability-row" role="row" key={workflow}>
              <strong role="cell">{workflow}</strong>
              <span role="cell">{analyses}</span>
              <span role="cell">{output}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="section proof-section">
        <div className="section-heading">
          <h2>What we do and what we do not do</h2>
          <p>This is the simplest way to understand Taskiflo for customers, Shopify reviewers, and Meta reviewers.</p>
        </div>
        <div className="do-dont-grid">
          <article className="panel">
            <h3>Taskiflo does</h3>
            <ul>
              <li>Draft marketing and support content for review.</li>
              <li>Organize approvals, calendars, product campaigns, and activity logs.</li>
              <li>Help merchants avoid accidental claims about price, stock, delivery, and policies.</li>
              <li>Keep the store owner in control of final customer-facing actions.</li>
            </ul>
          </article>
          <article className="panel warning-panel">
            <h3>Taskiflo does not</h3>
            <ul>
              <li>Publish or send automatically without owner approval.</li>
              <li>Replace platform permissions, merchant policies, or legal review.</li>
              <li>Promise delivery, discounts, inventory, or returns unless the merchant confirms them.</li>
              <li>Sell customer data or act outside authorized integrations.</li>
            </ul>
          </article>
        </div>
      </section>

      <section className="section" id="integrations">
        <div className="section-heading">
          <h2>Where Taskiflo fits</h2>
          <p>Taskiflo connects the places a store already works and turns scattered tasks into an approval-first queue.</p>
        </div>
        <div className="integration-grid">
          <Feature icon={Store} title="Shopify" text="Product launches, catalogue signals, campaign history, and store-safe marketing angles." />
          <Feature icon={MessageCircle} title="Instagram + Facebook" text="Post drafts, comment replies, messages, and page-specific marketing copy." />
          <Feature icon={Mail} title="Gmail" text="Customer reply drafts that use business memory while waiting for merchant approval." />
          <Feature icon={BarChart3} title="Google Sheets" text="Exports for calendars, approvals, campaign logs, and operating reports." />
        </div>
      </section>

      <section className="section split" id="who-for">
        <div>
          <h2>Who it is for</h2>
          <p>Taskiflo is built for small merchants who want AI speed but still need brand control, safety checks, and human approval before anything reaches customers.</p>
        </div>
        <div className="audience-list">
          <span><ShoppingBag size={18} /> Shopify stores launching products often</span>
          <span><Inbox size={18} /> Teams with customer questions across email and social</span>
          <span><CalendarCheck size={18} /> Owners who need a weekly content calendar</span>
          <span><LockKeyhole size={18} /> Merchants who cannot risk automatic posting</span>
        </div>
      </section>

      <section className="section assets-band">
        <div>
          <h2>What is still needed for app submission</h2>
          <p>These are the assets and fields you still need to upload or paste into Shopify and Meta review forms.</p>
        </div>
        <div className="asset-checklist">
          {[
            '1024 x 1024 app icon PNG',
            'At least 3 clean desktop screenshots',
            'Optional mobile screenshots',
            '3 to 8 minute screencast URL',
            'Reviewer test account username and password',
            'Feature media image or unlisted YouTube video',
            'Public pricing plan',
            'Privacy, terms, data deletion, support, and FAQ URLs',
          ].map((item) => (
            <span key={item}><Check size={16} /> {item}</span>
          ))}
        </div>
      </section>

      <section className="section pricing" id="pricing">
        <div>
          <h2>Simple launch pricing</h2>
          <p>Use this as the public Shopify plan while the app is in review. Full plan details now live on a dedicated pricing page.</p>
        </div>
        <article className="price-card">
          <span>Launch plan</span>
          <strong>$29/month</strong>
          <p>Approval-first AI drafts for small Shopify teams.</p>
          <ul>
            <li>Website and store signal analysis</li>
            <li>Social and email draft queue</li>
            <li>Approval inbox and content calendar</li>
            <li>Safety checks for sensitive claims</li>
          </ul>
          <a className="primary-button" href="/pricing">View pricing details <ArrowRight size={18} /></a>
        </article>
      </section>

      <Footer />
    </main>
  )
}

function Header() {
  return (
    <header className="site-header">
      <a className="brand" href="/">
        <span className="brand-icon"><Sparkles size={22} /></span>
        <strong>Taskiflo</strong>
      </a>
      <nav aria-label="Main navigation">
        <a href="/#what-we-do">What we do</a>
        <a href="/#workflow">Workflow</a>
        <a href="/#architecture">Architecture</a>
        <a href="/#integrations">Integrations</a>
        <a href="/pricing">Pricing</a>
        <a href="/app-store-assets">Submission</a>
        <a href="/support">Support</a>
      </nav>
      <a className="header-action" href="/privacy">Privacy</a>
    </header>
  )
}

function CommandPreview() {
  return (
    <div className="command-preview" aria-label="Taskiflo command center preview">
      <div className="preview-header">
        <span />
        <strong>Approval command center</strong>
        <small>Owner locked</small>
      </div>
      <div className="preview-grid">
        <aside>
          <span className="active">Command</span>
          <span>Website AI</span>
          <span>Approvals</span>
          <span>Shopify</span>
          <span>Calendar</span>
        </aside>
        <div className="preview-main">
          <div className="metrics">
            <Metric label="Drafts" value="24" />
            <Metric label="Needs review" value="7" />
            <Metric label="Scheduled" value="18" />
          </div>
          <article className="draft-card">
            <span>Shopify product launch</span>
            <h3>Coastal Linen Shirt campaign</h3>
            <p>AI drafted a post, checked stock and pricing language, and paused for owner approval.</p>
            <button type="button">Approve</button>
          </article>
          <article className="draft-card warning">
            <span>Safety check</span>
            <h3>Delivery promise blocked</h3>
            <p>Taskiflo flagged “arrives by Friday” until dispatch timing is confirmed.</p>
            <button type="button">Review</button>
          </article>
        </div>
      </div>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function Feature({ icon: Icon, title, text }: { icon: typeof Bot; title: string; text: string }) {
  return (
    <article className="feature-card">
      <Icon size={25} />
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  )
}

function LegalShell({ title, icon: Icon, children }: { title: string; icon: typeof ShieldCheck; children: React.ReactNode }) {
  return (
    <main>
      <Header />
      <section className="legal-page">
        <div className="legal-title">
          <Icon size={36} />
          <h1>{title}</h1>
        </div>
        <div className="legal-content">{children}</div>
      </section>
      <Footer />
    </main>
  )
}

function LegalPage({ title, icon, kind }: { title: string; icon: typeof ShieldCheck; kind: 'privacy' | 'terms' }) {
  return (
    <LegalShell title={title} icon={icon}>
      <p>Effective date: June 3, 2026</p>
      {kind === 'privacy' ? (
        <>
          <h2>What data Taskiflo uses</h2>
          <p>Taskiflo may process account contact details, store and website context, connected-channel metadata, draft content, approvals, activity logs, and support requests.</p>
          <h2>Why we use it</h2>
          <p>We use this information to create drafts, run approval workflows, maintain safety checks, support integrations, improve reliability, and respond to merchant requests.</p>
          <h2>Connected platforms</h2>
          <p>Merchants choose whether to connect Shopify, Meta, Google, Gmail, or reporting tools. Platform permissions are used only for authorized Taskiflo workflows.</p>
          <h2>Deletion</h2>
          <p>Merchants can request deletion at any time through the data deletion page or support email.</p>
        </>
      ) : (
        <>
          <h2>Service purpose</h2>
          <p>Taskiflo helps merchants draft, review, approve, schedule, and track marketing work. Merchants remain responsible for final customer-facing content and platform compliance.</p>
          <h2>Acceptable use</h2>
          <p>Do not use Taskiflo for unlawful, deceptive, harmful, infringing, spam, or unauthorized activity.</p>
          <h2>Approval responsibility</h2>
          <p>Taskiflo is designed to keep external actions locked until merchant approval. The merchant must verify claims about price, delivery, inventory, policies, and offers.</p>
        </>
      )}
    </LegalShell>
  )
}

function DeletionPage() {
  return (
    <LegalShell title="Data Deletion Instructions" icon={Trash2}>
      <p>Email {supportEmail} with the subject “Taskiflo data deletion request”. Include your account email, store domain, and connected channels you want removed.</p>
      <p>We verify ownership, disconnect authorized integrations where possible, and delete or anonymize account, profile, draft, approval, and support data associated with the request.</p>
      <p>Requests are typically completed within 30 days unless retention is required for legal, security, billing, or fraud-prevention reasons.</p>
    </LegalShell>
  )
}

function SupportPage() {
  return (
    <LegalShell title="Support" icon={HelpCircle}>
      <p>Contact Taskiflo support for reviewer access, merchant help, privacy requests, or app submission questions.</p>
      <div className="support-card"><strong>Email</strong><a href={`mailto:${supportEmail}`}>{supportEmail}</a></div>
      <div className="support-card"><strong>Website</strong><a href={siteUrl}>{siteUrl}</a></div>
      <div className="support-card"><strong>Fallback URL</strong><a href={fallbackUrl}>{fallbackUrl}</a></div>
      <h2>Reviewer testing instructions</h2>
      <ol>
        <li>Open the app URL and sign in with the supplied reviewer account.</li>
        <li>Review website AI, Shopify flows, engagement inbox, approval queue, editor, calendar, and analytics.</li>
        <li>Create or inspect a draft, confirm safety checks, approve it, and schedule it.</li>
        <li>Confirm that Taskiflo does not publish or send without approval.</li>
      </ol>
    </LegalShell>
  )
}

function FaqPage() {
  return (
    <LegalShell title="FAQ" icon={HelpCircle}>
      {[
        ['Does Taskiflo post automatically?', 'No. Drafts stay locked until the merchant approves, schedules, sends, or publishes them.'],
        ['What does Taskiflo create?', 'Taskiflo drafts customer replies, social posts, product campaigns, content calendar items, and reporting exports.'],
        ['Who is Taskiflo for?', 'Small Shopify merchants who want AI speed while keeping owner approval and brand control.'],
        ['What should reviewers test?', 'The approval-first flow: create a draft, review safety checks, approve it, schedule it, and confirm the action history.'],
      ].map(([question, answer]) => (
        <section className="faq-item" key={question}>
          <h2>{question}</h2>
          <p>{answer}</p>
        </section>
      ))}
    </LegalShell>
  )
}

function PricingPage() {
  return (
    <main>
      <Header />
      <section className="pricing-page">
        <div className="pricing-hero">
          <div>
            <span className="pricing-kicker">Simple launch plan</span>
            <h1>Pricing built for approval-first Shopify automation</h1>
            <p>
              Taskiflo starts with one clear monthly plan for small Shopify teams that want AI drafting, workflow control, and owner approval before anything reaches customers.
            </p>
          </div>
          <article className="pricing-plan-card">
            <span>Launch plan</span>
            <strong>$29/month</strong>
            <p>For one Shopify business workspace using approval-first AI drafts and calendar workflows.</p>
            <a className="primary-button" href="/support">Contact support <ArrowRight size={18} /></a>
          </article>
        </div>

        <section className="pricing-detail-grid" aria-label="Launch plan details">
          <article className="pricing-feature-panel">
            <h2>Included in the launch plan</h2>
            <div className="pricing-feature-list">
              {launchPlanFeatures.map((feature) => (
                <span key={feature}><Check size={16} /> {feature}</span>
              ))}
            </div>
          </article>
          <article className="pricing-feature-panel pricing-note-panel">
            <h2>How billing works</h2>
            <p>The public launch plan is priced monthly. During review, this gives Shopify and Meta reviewers a clear paid plan to evaluate while Taskiflo remains simple for early merchants.</p>
            <p>Final sends, posts, and customer-facing actions remain controlled by the merchant. Pricing does not change the approval-first safety model.</p>
          </article>
        </section>

        <section className="pricing-workflow-section">
          <div className="section-heading">
            <h2>What the plan covers</h2>
            <p>The launch plan covers the practical workflow a merchant needs from setup to approval tracking.</p>
          </div>
          <div className="pricing-workflow-grid">
            {pricingWorkflowItems.map(([title, text], index) => (
              <article key={title}>
                <span>{index + 1}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="pricing-faq-grid" aria-label="Pricing questions">
          {[
            ['Is there a free plan?', 'Not for launch. The review-ready public plan is the $29/month Launch plan.'],
            ['Can merchants cancel?', 'Yes. Merchants should contact support for account, billing, or removal requests while the app is in early launch.'],
            ['Does the plan publish automatically?', 'No. Taskiflo is approval-first. The merchant reviews and approves drafts before external actions.'],
            ['What if a business needs more volume?', 'Larger workflows can be handled through support while Taskiflo expands plan tiers.'],
          ].map(([question, answer]) => (
            <article className="faq-item" key={question}>
              <h2>{question}</h2>
              <p>{answer}</p>
            </article>
          ))}
        </section>
      </section>
      <Footer />
    </main>
  )
}

function AssetsPage() {
  return (
    <LegalShell title="Submission Assets" icon={FileText}>
      <p>Use these fields in Meta and Shopify review forms. If `taskiflo.com` DNS is still propagating, use the Vercel fallback URL temporarily.</p>
      <div className="asset-grid">
        {submissionValues.map(([label, value]) => (
          <div className="copy-block" key={label}>
            <span>{label}</span>
            <p>{value}</p>
          </div>
        ))}
        <div className="copy-block">
          <span>Screencast recommendation</span>
          <p>Record a 3 to 8 minute unlisted YouTube video showing login, onboarding, Shopify workflow, draft creation, approval queue, editor, calendar, and support pages.</p>
        </div>
      </div>
    </LegalShell>
  )
}

function Footer() {
  return (
    <footer className="site-footer">
      <div>
        <strong>Taskiflo</strong>
        <span>Approval-first AI marketing automation for Shopify stores.</span>
      </div>
      <nav aria-label="Footer navigation">
        <a href="/privacy">Privacy</a>
        <a href="/terms">Terms</a>
        <a href="/data-deletion">Data deletion</a>
        <a href="/pricing">Pricing</a>
        <a href="/faq">FAQ</a>
        <a href="/support">Support</a>
      </nav>
    </footer>
  )
}

function getRoute(): Route {
  const path = window.location.pathname.replace(/\/+$/, '') || '/'
  if (path === '/privacy') return 'privacy'
  if (path === '/terms') return 'terms'
  if (path === '/data-deletion') return 'data-deletion'
  if (path === '/support') return 'support'
  if (path === '/faq') return 'faq'
  if (path === '/pricing') return 'pricing'
  if (path === '/app-store-assets') return 'app-store-assets'
  return 'home'
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
