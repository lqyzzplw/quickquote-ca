import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { adminClient } from '@/lib/supabase/admin'
import { calculateTax } from '@/lib/tax'
import type { Province } from '@/lib/tax'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('quotes')
    .select('*, clients(name, email)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { title, description_raw, client_id, line_items } = body

  if (!title?.trim()) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 })
  }
  if (!line_items?.length) {
    return NextResponse.json({ error: 'At least one line item is required' }, { status: 400 })
  }

  // Get user's province for tax calculation
  const { data: profile } = await supabase
    .from('users')
    .select('province, plan, quotes_sent_this_month')
    .eq('id', user.id)
    .single()

  // Generate quote number via RPC
  const { data: quoteNumber } = await adminClient
    .rpc('next_quote_number')
  const finalQuoteNumber = (quoteNumber as string) ?? `QQ-${Date.now()}`

  // Calculate totals
  const subtotal = line_items.reduce(
    (sum: number, item: { quantity: number; unit_price: number }) =>
      sum + item.quantity * item.unit_price,
    0
  )

  let taxAmount = 0
  let taxType = null
  let taxRate = null

  if (profile?.province) {
    const tax = calculateTax(subtotal, profile.province as Province)
    taxAmount = tax.taxAmount
    taxType = tax.taxType
    taxRate = tax.lines.reduce((sum, l) => sum + l.rate, 0)
  }

  const total = subtotal + taxAmount
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 30)

  // Insert quote
  const { data: quote, error: quoteError } = await supabase
    .from('quotes')
    .insert({
      user_id: user.id,
      client_id: client_id || null,
      quote_number: finalQuoteNumber,
      title: title.trim(),
      description_raw: description_raw || null,
      subtotal: Math.round(subtotal * 100) / 100,
      tax_amount: taxAmount,
      tax_type: taxType,
      tax_rate: taxRate,
      total: Math.round(total * 100) / 100,
      expires_at: expiresAt.toISOString().split('T')[0],
    })
    .select()
    .single()

  if (quoteError) return NextResponse.json({ error: quoteError.message }, { status: 500 })

  // Insert line items
  const { error: itemsError } = await supabase
    .from('quote_line_items')
    .insert(
      line_items.map((item: { description: string; quantity: number; unit_price: number }, i: number) => ({
        quote_id: quote.id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        sort_order: i,
      }))
    )

  if (itemsError) return NextResponse.json({ error: itemsError.message }, { status: 500 })

  return NextResponse.json({ data: quote }, { status: 201 })
}
