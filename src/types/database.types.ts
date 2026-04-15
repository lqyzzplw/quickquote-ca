export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          business_name: string | null
          logo_url: string | null
          province: string | null
          plan: string
          quotes_sent_this_month: number
          billing_cycle_start: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          business_name?: string | null
          logo_url?: string | null
          province?: string | null
          plan?: string
          quotes_sent_this_month?: number
          billing_cycle_start?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['users']['Insert']>
      }
      clients: {
        Row: {
          id: string
          user_id: string
          name: string
          email: string | null
          phone: string | null
          address: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          email?: string | null
          phone?: string | null
          address?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<Database['public']['Tables']['clients']['Insert'], 'user_id'>>
      }
      quotes: {
        Row: {
          id: string
          user_id: string
          client_id: string | null
          quote_number: string
          title: string
          description_raw: string | null
          status: string
          subtotal: number
          tax_amount: number
          total: number
          tax_type: string | null
          tax_rate: number | null
          pdf_url: string | null
          expires_at: string | null
          sent_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          client_id?: string | null
          quote_number: string
          title: string
          description_raw?: string | null
          status?: string
          subtotal?: number
          tax_amount?: number
          total?: number
          tax_type?: string | null
          tax_rate?: number | null
          pdf_url?: string | null
          expires_at?: string | null
          sent_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<Database['public']['Tables']['quotes']['Insert'], 'user_id'>>
      }
      quote_line_items: {
        Row: {
          id: string
          quote_id: string
          description: string
          quantity: number
          unit_price: number
          line_total: number
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          quote_id: string
          description: string
          quantity?: number
          unit_price?: number
          sort_order?: number
          created_at?: string
        }
        Update: Partial<Omit<Database['public']['Tables']['quote_line_items']['Insert'], 'quote_id'>>
      }
    }
  }
}
