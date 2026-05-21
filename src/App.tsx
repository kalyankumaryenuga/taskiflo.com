import {
  ArrowRight,
  BarChart3,
  CalendarCheck,
  Check,
  ChevronRight,
  FileText,
  Globe2,
  HelpCircle,
  Inbox,
  LockKeyhole,
  Mail,
  MessageCircle,
  Play,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
  Trash2,
  Wand2,
} from 'lucide-react'

type Route = 'home' | 'privacy' | 'terms' | 'data-deletion' | 'support' | 'faq' | 'assets'

const siteUrl = 'https://taskiflo.com'
const supportEmail = 'support@taskiflo.com'

const navItems = [
  { label: 'Workflow', href: '#workflow' },
  { label: 'Integrations', href: '#integrations' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Support', href: '/support' },
]

const integrations = ['Shopify', 'Instagram', 'Facebook Pages', 'Gmail', 'Google Sheets']

const features = [
  'Website AI analysis',
  'Business profile memory',
  'Approval-first posting',
  'Gmail reply drafts',
  'Shopify store integration',
]

const searchTerms = ['marketing automation', 'social media', 'approval workflow', 'content calendar', 'AI marketing']

const faqItems = [
  {
    question: 'Does Taskiflo publish without approval?',
    answer:
      'No. Taskiflo is designed around an approval-first workflow. Drafts are created for review, then the merchant approves, edits, schedules, posts, or sends them.',
  },
  {
    question: 'Which channels does Taskiflo support?',
    answer:
      'The current submission focuses on Shopify product workflows, Instagram and Facebook content, Gmail reply drafts, and Google Sheets exports.',
  },
  {
    question: 'Is Taskiflo for agencies or merchants?',
    answer:
      'Taskiflo is built for small merchants and lean teams that need a practical marketing assistant without losing control of their brand voice.',
  },
  {
    question: 'Can reviewers access a test account?',
    answer:
      'Yes. A reviewer test account should be provided in the app submission, along with a short screencast that shows onboarding and core approval flows.',
  },
]

export function App() {
  const route = getRoute()

  if (route === 'privacy') {
    return <PolicyPage kind="privacy" />
  }

  if (route === 'terms') {
    return <PolicyPage kind="terms" />
  }

  if (route === 'data-deletion') {
    return <DataDeletionPage />
  }

  if (route === 'support') {
    return <SupportPage />
  }

  if (route === 'faq') {
    return <FaqPage />
  }

  if (route === 'assets') {
    return <AssetsPage />
  }

  return <HomePage />
}

function HomePage() {
  return (
    <main>
      <Header />
      <section className="hero-section">
        <div className="hero-copy">
          <h1>Taskiflo</h1>
          <p className="hero-lede">
            AI marketing automation for Shopify stores that drafts posts, replies, and product campaigns, then waits for merchant approval before anything goes live.
          </p>
          <div className="hero-actions">
            <a className="primary-button" href="#pricing">
              Start with the launch plan
              <ArrowRight size={18} />
            </a>
            <a className="ghost-button" href="/app-store-assets">
              View app submission assets
              <FileText size={18} />
            </a>
          </div>
          <div className="hero-proof" aria-label="Taskiflo highlights">
            <span>Approval-first</span>
            <span>Shopify-ready</span>
            <span>Meta app review pages included</span>
          </div>
        </div>
        <ProductPreview />
      </section>

      <section className="section-band" id="workflow">
        <div className="section-heading">
          <h2>One workflow from store signal to approved output</h2>
          <p>Taskiflo turns product changes, customer questions, and website context into brand-safe work a merchant can review quickly.</p>
        </div>
        <div className="workflow-grid">
          <WorkflowStep icon={Globe2} title="Learn the business" text="Read the website, tone, products, audience, offers, and content rules." />
          <WorkflowStep icon={Wand2} title="Draft useful work" text="Create platform-specific posts, email replies, and Shopify product launch copy." />
          <WorkflowStep icon={Inbox} title="Hold for approval" text="Route every generated item into a review inbox before scheduling or sending." />
          <WorkflowStep icon={CalendarCheck} title="Schedule confidently" text="Move approved outputs into a calendar with channel and timing context." />
        </div>
      </section>

      <section className="split-section">
        <div>
          <h2>Built for reviewers, merchants, and real store operations</h2>
          <p>
            The public site includes the pages required for app platform review: privacy policy, terms, data deletion instructions, support, FAQ, and submission asset guidance.
          </p>
          <div className="check-list">
            {features.map((feature) => (
              <span key={feature}>
                <Check size={16} />
                {feature}
              </span>
            ))}
          </div>
        </div>
        <div className="review-panel">
          <div className="review-row">
            <ShieldCheck size={22} />
            <div>
              <strong>Merchant control</strong>
              <span>Nothing posts or sends until the store owner approves it.</span>
            </div>
          </div>
          <div className="review-row">
            <LockKeyhole size={22} />
            <div>
              <strong>Clear data pages</strong>
              <span>Privacy, terms, and deletion URLs are ready for Meta and Shopify forms.</span>
            </div>
          </div>
          <div className="review-row">
            <Play size={22} />
            <div>
              <strong>Screencast-ready</strong>
              <span>The homepage and product preview show the exact approval story to record.</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section-band" id="integrations">
        <div className="section-heading">
          <h2>Connect the channels small stores already use</h2>
          <p>Taskiflo keeps channel-specific copy, customer replies, and product workflows in one approval queue.</p>
        </div>
        <div className="integration-grid">
          {integrations.map((item) => (
            <article className="integration-card" key={item}>
              <span className="integration-icon">
                {item === 'Shopify' ? <Store size={24} /> : item === 'Gmail' ? <Mail size={24} /> : item === 'Google Sheets' ? <BarChart3 size={24} /> : <MessageCircle size={24} />}
              </span>
              <h3>{item}</h3>
              <p>{getIntegrationCopy(item)}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="app-store-section">
        <div>
          <h2>Shopify listing copy you can paste now</h2>
          <p>Use this concise content for the open Shopify fields shown in your screenshots, then add screenshots and a screencast after deployment.</p>
        </div>
        <div className="listing-copy">
          <CopyBlock label="App card subtitle" value="Approval-first AI marketing for Shopify stores" />
          <CopyBlock label="Search terms" value={searchTerms.join(', ')} />
          <CopyBlock label="Title tag" value="Taskiflo | Approval-first AI marketing automation" />
          <CopyBlock label="Meta description" value="Taskiflo helps Shopify stores draft social posts, Gmail replies, and product campaigns with merchant approval before publishing." />
        </div>
      </section>

      <section className="pricing-section" id="pricing">
        <div className="pricing-copy">
          <h2>Simple launch pricing</h2>
          <p>Submit one public plan for review and link this page as the pricing information URL.</p>
        </div>
        <article className="price-card">
          <span>Launch plan</span>
          <strong>$29/month</strong>
          <p>For small Shopify stores preparing approval-first marketing workflows.</p>
          <ul>
            <li>Shopify product campaign drafts</li>
            <li>Instagram and Facebook post drafts</li>
            <li>Gmail reply draft queue</li>
            <li>Content calendar and approval inbox</li>
          </ul>
          <a className="primary-button" href="/support">
            Contact support
            <ChevronRight size={18} />
          </a>
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
        <span className="brand-icon">
          <Sparkles size={22} />
        </span>
        <strong>Taskiflo</strong>
      </a>
      <nav aria-label="Main navigation">
        {navItems.map((item) => (
          <a key={item.label} href={item.href}>
            {item.label}
          </a>
        ))}
      </nav>
      <a className="header-action" href="/privacy">
        Privacy
      </a>
    </header>
  )
}

function ProductPreview() {
  return (
    <div className="product-preview" aria-label="Taskiflo app preview">
      <div className="preview-topbar">
        <span />
        <strong>Approval inbox</strong>
        <small>Local demo</small>
      </div>
      <div className="preview-layout">
        <aside>
          <span className="active">Dashboard</span>
          <span>Website AI</span>
          <span>Shopify Flows</span>
          <span>Engagement</span>
          <span>Calendar</span>
        </aside>
        <div className="preview-content">
          <div className="metric-strip">
            <PreviewMetric label="Drafts" value="24" />
            <PreviewMetric label="Waiting" value="6" />
            <PreviewMetric label="Scheduled" value="18" />
          </div>
          <article className="approval-card">
            <div>
              <span>Instagram / Shopify</span>
              <h3>New product launch: Coastal Linen Shirt</h3>
              <p>A warm product caption drafted from store details, brand voice, and current offers.</p>
            </div>
            <button type="button">Approve</button>
          </article>
          <article className="approval-card muted">
            <div>
              <span>Gmail reply</span>
              <h3>Wholesale pricing request</h3>
              <p>Draft response prepared for review before sending.</p>
            </div>
            <button type="button">Edit</button>
          </article>
        </div>
      </div>
    </div>
  )
}

function PreviewMetric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function WorkflowStep({ icon: Icon, title, text }: { icon: typeof Globe2; title: string; text: string }) {
  return (
    <article className="workflow-card">
      <Icon size={24} />
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  )
}

function CopyBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="copy-block">
      <span>{label}</span>
      <p>{value}</p>
    </div>
  )
}

function PolicyPage({ kind }: { kind: 'privacy' | 'terms' }) {
  const isPrivacy = kind === 'privacy'
  return (
    <LegalShell title={isPrivacy ? 'Privacy Policy' : 'Terms of Service'} icon={isPrivacy ? ShieldCheck : FileText}>
      <p>Effective date: May 21, 2026</p>
      {isPrivacy ? (
        <>
          <h2>Information we process</h2>
          <p>Taskiflo processes account contact details, merchant-provided business profile details, connected store content, draft marketing outputs, approval actions, and support requests.</p>
          <h2>How information is used</h2>
          <p>We use this information to provide approval-first marketing automation, create drafts, maintain workflow history, support integrations, improve reliability, and respond to support requests.</p>
          <h2>Third-party services</h2>
          <p>Taskiflo may connect with Shopify, Meta, Google, and email or analytics providers when a merchant chooses to authorize those services. Each provider controls its own platform and permissions.</p>
          <h2>Data retention and deletion</h2>
          <p>Merchants can request deletion at any time using the data deletion page. We delete or anonymize account data unless retention is required for security, legal, or billing reasons.</p>
        </>
      ) : (
        <>
          <h2>Use of the service</h2>
          <p>Taskiflo helps merchants draft and manage marketing outputs. Merchants remain responsible for reviewing, approving, editing, and publishing content that represents their business.</p>
          <h2>Acceptable use</h2>
          <p>Do not use Taskiflo to create deceptive, unlawful, infringing, harmful, or spam content. Connected platform terms also apply to any integrations you authorize.</p>
          <h2>Subscriptions</h2>
          <p>Paid plans are billed according to the selected plan terms. For Shopify installations, billing should be handled through Shopify Billing unless a separate approved arrangement applies.</p>
          <h2>Service changes</h2>
          <p>We may improve, update, or discontinue features while working to preserve merchant data access and reasonable notice for material changes.</p>
        </>
      )}
    </LegalShell>
  )
}

function DataDeletionPage() {
  return (
    <LegalShell title="Data Deletion Instructions" icon={Trash2}>
      <p>Effective date: May 21, 2026</p>
      <h2>Request deletion</h2>
      <p>Email {supportEmail} with the subject line “Taskiflo data deletion request” and include the account email, store domain, and any connected channels you want removed.</p>
      <h2>What happens next</h2>
      <p>We verify ownership, disconnect authorized integrations where possible, and delete or anonymize account, profile, draft, approval, and support data associated with the request.</p>
      <h2>Expected timing</h2>
      <p>Deletion requests are typically completed within 30 days. Some records may be retained where required for legal, security, billing, or fraud-prevention purposes.</p>
    </LegalShell>
  )
}

function SupportPage() {
  return (
    <LegalShell title="Support" icon={HelpCircle}>
      <p>For app review, merchant support, privacy requests, or account questions, contact Taskiflo support.</p>
      <div className="support-card">
        <strong>Email</strong>
        <a href={`mailto:${supportEmail}`}>{supportEmail}</a>
      </div>
      <div className="support-card">
        <strong>Developer website</strong>
        <a href={siteUrl}>{siteUrl}</a>
      </div>
      <h2>Testing instructions for reviewers</h2>
      <ol>
        <li>Open the Taskiflo app or demo URL provided in the submission.</li>
        <li>Sign in with the supplied reviewer account.</li>
        <li>Review the dashboard, website AI flow, Shopify flows, engagement inbox, approval inbox, post editor, calendar, and analytics pages.</li>
        <li>Create or edit a draft, approve it, schedule it, and confirm the approval-first workflow.</li>
      </ol>
    </LegalShell>
  )
}

function FaqPage() {
  return (
    <LegalShell title="FAQ" icon={HelpCircle}>
      {faqItems.map((item) => (
        <section className="faq-item" key={item.question}>
          <h2>{item.question}</h2>
          <p>{item.answer}</p>
        </section>
      ))}
    </LegalShell>
  )
}

function AssetsPage() {
  return (
    <LegalShell title="Submission Assets" icon={FileText}>
      <p>Use these values for the open Meta and Shopify fields shown in your screenshots. Replace any test credentials and screencast URL with your real reviewer materials before final submission.</p>
      <div className="asset-grid">
        <CopyBlock label="Privacy policy URL" value={`${siteUrl}/privacy`} />
        <CopyBlock label="Terms of Service URL" value={`${siteUrl}/terms`} />
        <CopyBlock label="Data deletion URL" value={`${siteUrl}/data-deletion`} />
        <CopyBlock label="Support email" value={supportEmail} />
        <CopyBlock label="Developer website" value={siteUrl} />
        <CopyBlock label="FAQ URL" value={`${siteUrl}/faq`} />
        <CopyBlock label="Pricing URL" value={`${siteUrl}/#pricing`} />
        <CopyBlock label="App card subtitle" value="Approval-first AI marketing for Shopify stores" />
        <CopyBlock label="Search terms" value={searchTerms.join(', ')} />
        <CopyBlock label="Feature media recommendation" value="Record a 3 to 8 minute unlisted YouTube screencast showing onboarding, Shopify flow, approval inbox, editor, calendar, and support pages." />
      </div>
    </LegalShell>
  )
}

function LegalShell({ title, icon: Icon, children }: { title: string; icon: typeof ShieldCheck; children: React.ReactNode }) {
  return (
    <main>
      <Header />
      <section className="legal-page">
        <div className="legal-title">
          <Icon size={34} />
          <h1>{title}</h1>
        </div>
        <div className="legal-content">{children}</div>
      </section>
      <Footer />
    </main>
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
        <a href="/faq">FAQ</a>
        <a href="/support">Support</a>
      </nav>
    </footer>
  )
}

function getIntegrationCopy(name: string) {
  if (name === 'Shopify') return 'Import product context, launch new arrivals, and rotate store items into approved campaigns.'
  if (name === 'Gmail') return 'Draft customer replies from store policy and business memory, then hold them for approval.'
  if (name === 'Google Sheets') return 'Export calendars, approvals, and campaign history for operations and reporting.'
  return 'Prepare channel-specific content while keeping final approval with the merchant.'
}

function getRoute(): Route {
  const path = window.location.pathname.replace(/\/+$/, '') || '/'
  if (path === '/privacy') return 'privacy'
  if (path === '/terms') return 'terms'
  if (path === '/data-deletion') return 'data-deletion'
  if (path === '/support') return 'support'
  if (path === '/faq') return 'faq'
  if (path === '/app-store-assets') return 'assets'
  return 'home'
}
