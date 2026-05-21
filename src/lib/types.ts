export type ApprovalItem = {
  type: string
  source: string
  title: string
  preview: string
  status: string
  customerName?: string
  inboundText?: string
  contextLabel?: string
  approvedAt?: string
  scheduledAt?: string
  publishedAt?: string
}

export type ProfileField = {
  label: string
  value: string
}

export type AppSnapshot = {
  websiteUrl: string
  approvalRequired: boolean
  campaignMode: string
  profileFields: ProfileField[]
  approvals: ApprovalItem[]
  connections: Record<string, boolean>
}

export type Database = {
  public: {
    Tables: {
      businesses: {
        Row: {
          id: string
          owner_id: string
          name: string
          website_url: string | null
          operating_location: string | null
          marketing_regions: string | null
          target_audience: string | null
          main_offer: string | null
          brand_voice: string | null
          content_rules: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          name?: string
          website_url?: string | null
          operating_location?: string | null
          marketing_regions?: string | null
          target_audience?: string | null
          main_offer?: string | null
          brand_voice?: string | null
          content_rules?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['businesses']['Insert']>
        Relationships: []
      }
      content_drafts: {
        Row: {
          id: string
          business_id: string
          product_id: string | null
          source: string
          content_type: string
          platform: string
          title: string
          body: string
          hashtags: string[]
          cta: string | null
          status: string
          scheduled_at: string | null
          approved_at: string | null
          published_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_id: string
          product_id?: string | null
          source?: string
          content_type: string
          platform: string
          title: string
          body: string
          hashtags?: string[]
          cta?: string | null
          status?: string
          scheduled_at?: string | null
          approved_at?: string | null
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['content_drafts']['Insert']>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
