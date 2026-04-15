# Project Conventions

## File Naming
- All files: `kebab-case.ts` / `kebab-case.tsx`
- Components: PascalCase exports, kebab-case files (e.g. `line-item-editor.tsx` exports `LineItemEditor`)
- API routes: `src/app/api/[resource]/route.ts`

## Supabase Client Pattern
```ts
// Browser (Client Components only)
// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'
export const createClient = () => createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Server (API routes, Server Components)
// src/lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
export const createClient = () => createServerClient(...)

// Admin (webhooks, server-side mutations bypassing RLS)
import { createClient } from '@supabase/supabase-js'
export const adminClient = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!)
```

## API Response Shape
```ts
// Success
return NextResponse.json({ data: result })
// Error
return NextResponse.json({ error: 'message' }, { status: 400 })
```

## Type Locations
- Domain types: `src/types/index.ts`
- Database types (generated): `src/types/database.types.ts`

## Core Types
```ts
type Province = 'ON' | 'BC' | 'AB' | 'QC' | 'MB' | 'SK' | 'NB' | 'NS' | 'NL' | 'PEI' | 'NT' | 'NU' | 'YT'
type Plan = 'free' | 'pro'
type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'declined'
type TaxType = 'HST' | 'GST' | 'GST+PST' | 'GST+QST'
```

## Tax Engine (src/lib/tax.ts)
```ts
getTaxConfig(province: Province) => { type: TaxType, rates: { name: string, rate: number }[] }
calculateTax(subtotal: number, province: Province) => { lines: TaxLine[], total: number }
```

## Git Conventions
- Branches: `feat/short-name` | `fix/what-broke` | `chore/what-changed`
- Commits: conventional commits (`feat:` `fix:` `chore:` `docs:`)
- Never force-push, never --no-verify

## Env Var Prefixes
- `NEXT_PUBLIC_*` — safe for browser
- No prefix — server only (secrets)
