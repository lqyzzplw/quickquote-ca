import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { adminClient } from '@/lib/supabase/admin'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// Coarse per-user daily cap so a logged-in user can't drain the Anthropic
// budget. Counter columns live on users (M4 migration). Fails OPEN if the
// columns aren't migrated yet, so deploying code before the migration degrades
// to "no limit" (logged) rather than breaking parsing.
const AI_PARSE_DAILY_CAP = Number(process.env.AI_PARSE_DAILY_CAP ?? 40)

export async function POST(request: Request) {
  // Auth check
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { description, province } = await request.json()
  if (!description?.trim()) {
    return NextResponse.json({ error: 'Description is required' }, { status: 400 })
  }

  // Per-user daily rate limit (M4)
  const todayStr = new Date().toISOString().split('T')[0]
  const { data: usage, error: usageErr } = await adminClient
    .from('users')
    .select('ai_parses_today, ai_parses_date')
    .eq('id', user.id)
    .single()
  if (usageErr) {
    console.warn('AI parse rate-limit check skipped (run the M4 migration?):', usageErr.message)
  } else {
    const usedToday = usage?.ai_parses_date === todayStr ? (usage.ai_parses_today ?? 0) : 0
    if (usedToday >= AI_PARSE_DAILY_CAP) {
      return NextResponse.json(
        { error: 'Daily AI limit reached. Fill in the quote manually or try again tomorrow.' },
        { status: 429 }
      )
    }
    await adminClient
      .from('users')
      .update({ ai_parses_today: usedToday + 1, ai_parses_date: todayStr })
      .eq('id', user.id)
  }

  try {
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `You are a quoting assistant for Canadian tradespeople. Parse this job description into a structured quote.

Job description: "${description}"
Province: ${province ?? 'unknown'}

Respond with ONLY valid JSON in this exact format — no explanation, no markdown:
{
  "title": "short job title (e.g. Hot Water Tank Replacement)",
  "line_items": [
    { "description": "item description", "quantity": 1, "unit_price": 0 }
  ]
}

Rules:
- Extract every distinct item, material, or labour charge mentioned
- If hours and hourly rate are mentioned, split into a labour line item
- If a lump sum is mentioned with no breakdown, create one line item
- Use realistic Canadian trade pricing if prices aren't specified
- quantity must be a number, unit_price must be a number in CAD
- Keep descriptions concise (under 60 chars)
- 1–8 line items maximum`,
        },
      ],
    })

    const raw = message.content[0].type === 'text' ? message.content[0].text : ''
    const parsed = JSON.parse(raw)

    // Validate shape
    if (!parsed.title || !Array.isArray(parsed.line_items)) {
      throw new Error('Invalid AI response shape')
    }

    return NextResponse.json({ data: parsed })
  } catch (err) {
    console.error('AI parse error:', err)
    // Graceful fallback — return empty so user can fill manually
    return NextResponse.json({
      data: { title: '', line_items: [] },
      warning: 'Could not parse description — please fill in manually',
    })
  }
}
