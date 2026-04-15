export type Province =
  | 'ON' | 'NB' | 'NS' | 'NL' | 'PEI'
  | 'BC' | 'MB' | 'SK'
  | 'QC'
  | 'AB' | 'NT' | 'NU' | 'YT'

export type Plan = 'free' | 'pro'
export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'declined'
export type TaxType = 'HST' | 'GST' | 'GST+PST' | 'GST+QST'

export interface User {
  id: string
  email: string
  name: string | null
  business_name: string | null
  logo_url: string | null
  province: Province | null
  plan: Plan
  quotes_sent_this_month: number
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  created_at: string
  updated_at: string
}

export interface Client {
  id: string
  user_id: string
  name: string
  email: string | null
  phone: string | null
  address: string | null
  created_at: string
  updated_at: string
}

export interface QuoteLineItem {
  id: string
  quote_id: string
  description: string
  quantity: number
  unit_price: number
  line_total: number
  sort_order: number
}

export interface Quote {
  id: string
  user_id: string
  client_id: string | null
  quote_number: string
  title: string
  description_raw: string | null
  status: QuoteStatus
  subtotal: number
  tax_amount: number
  total: number
  tax_type: TaxType | null
  tax_rate: number | null
  pdf_url: string | null
  expires_at: string | null
  sent_at: string | null
  created_at: string
  updated_at: string
  // joined
  client?: Client
  line_items?: QuoteLineItem[]
}

export interface AIParseResponse {
  title: string
  line_items: {
    description: string
    quantity: number
    unit_price: number
  }[]
}
