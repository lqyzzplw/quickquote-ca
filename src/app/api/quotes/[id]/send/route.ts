import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { generateQuotePDF, type PDFClient } from '@/lib/pdf'
import type { Quote, User } from '@/types'

let _resend: Resend | null = null
function getResend(): Resend {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY)
  return _resend
}

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Fetch quote with all relations
  const { data: quote, error: quoteErr } = await supabase
    .from('quotes')
    .select('*, client:clients(*), quote_line_items(*)')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .order('sort_order', { referencedTable: 'quote_line_items', ascending: true })
    .single()

  if (quoteErr || !quote) return NextResponse.json({ error: 'Quote not found' }, { status: 404 })

  const lineItems = (quote as unknown as { quote_line_items: Quote['line_items'] }).quote_line_items ?? []
  if (!lineItems?.length) return NextResponse.json({ error: 'Quote has no line items' }, { status: 400 })

  // Need a client with email
  const client = (quote as unknown as { client: PDFClient | null }).client
  if (!client?.email) {
    return NextResponse.json({ error: 'Client has no email address. Add one in Clients first.' }, { status: 400 })
  }

  // Fetch user profile for PDF
  const { data: profile } = await supabase
    .from('users')
    .select('name, business_name, province, plan, quotes_sent_this_month, billing_cycle_start')
    .eq('id', user.id)
    .single()

  // Monthly freemium gate — reset the counter when the billing cycle has rolled over (H2)
  const today = new Date()
  const cycleStart = profile?.billing_cycle_start ? new Date(profile.billing_cycle_start) : null
  const cycleExpired =
    !cycleStart ||
    today >= new Date(cycleStart.getFullYear(), cycleStart.getMonth() + 1, cycleStart.getDate())
  const usedThisCycle = cycleExpired ? 0 : (profile?.quotes_sent_this_month ?? 0)

  if (profile?.plan === 'free' && usedThisCycle >= 3) {
    return NextResponse.json({
      error: 'Free plan limit reached (3 quotes/month). Upgrade to Pro to send more.',
      upgrade: true,
    }, { status: 403 })
  }

  // Generate PDF
  let pdfBuffer: Buffer
  try {
    pdfBuffer = await generateQuotePDF({
      quote: {
        ...(quote as unknown as Quote),
        line_items: lineItems as NonNullable<Quote['line_items']>,
        client: client ?? undefined,
      } as Parameters<typeof generateQuotePDF>[0]['quote'],
      user: profile as Pick<User, 'name' | 'business_name' | 'province'>,
    })
  } catch (err) {
    console.error('PDF generation error:', err)
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 })
  }

  // Send email via Resend
  const businessName = profile?.business_name ?? profile?.name ?? 'Your contractor'
  const { error: emailErr } = await getResend().emails.send({
    from: `QuickQuote CA <${process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev'}>`,
    to: [client.email],
    subject: `Quote ${quote.quote_number} from ${businessName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; color: #111827;">
        <h2 style="font-size: 20px; margin-bottom: 4px;">You have a new quote</h2>
        <p style="color: #6b7280; margin-top: 0;">From <strong>${businessName}</strong></p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 6px 0; color: #6b7280;">Quote #</td><td style="padding: 6px 0; font-weight: 600;">${quote.quote_number}</td></tr>
          <tr><td style="padding: 6px 0; color: #6b7280;">Description</td><td style="padding: 6px 0;">${quote.title}</td></tr>
          <tr><td style="padding: 6px 0; color: #6b7280;">Total</td><td style="padding: 6px 0; font-weight: 600; font-size: 16px;">$${Number(quote.total).toFixed(2)} CAD</td></tr>
          <tr><td style="padding: 6px 0; color: #6b7280;">Valid until</td><td style="padding: 6px 0;">${quote.expires_at ?? '30 days'}</td></tr>
        </table>
        <p style="margin-top: 20px; color: #6b7280; font-size: 14px;">
          The full quote is attached as a PDF. Please review and reply to this email to accept or ask questions.
        </p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
        <p style="font-size: 12px; color: #9ca3af;">Sent via QuickQuote CA</p>
      </div>
    `,
    attachments: [
      {
        filename: `${quote.quote_number}.pdf`,
        content: pdfBuffer,
      },
    ],
  })

  if (emailErr) {
    console.error('Email send error:', emailErr)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }

  // Update quote status + sent_at (L6: surface the error instead of swallowing it)
  const { error: statusErr } = await supabase
    .from('quotes')
    .update({ status: 'sent', sent_at: new Date().toISOString() })
    .eq('id', params.id)
    .eq('user_id', user.id)
  if (statusErr) console.error('Quote status update failed after send:', statusErr)

  // Increment the cycle counter, resetting the window if the cycle expired (H2)
  await getAdminClient()
    .from('users')
    .update({
      quotes_sent_this_month: usedThisCycle + 1,
      billing_cycle_start: cycleExpired
        ? today.toISOString().split('T')[0]
        : (profile?.billing_cycle_start ?? today.toISOString().split('T')[0]),
    })
    .eq('id', user.id)

  return NextResponse.json({ data: { success: true } })
}
