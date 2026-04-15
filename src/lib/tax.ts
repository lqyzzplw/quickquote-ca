export type Province =
  | 'ON' | 'NB' | 'NS' | 'NL' | 'PEI'  // HST
  | 'BC' | 'MB' | 'SK'                   // GST + PST
  | 'QC'                                  // GST + QST
  | 'AB' | 'NT' | 'NU' | 'YT'           // GST only

export type TaxType = 'HST' | 'GST' | 'GST+PST' | 'GST+QST'

export interface TaxLine {
  name: string
  rate: number
  amount: number
}

export interface TaxConfig {
  type: TaxType
  lines: { name: string; rate: number }[]
}

const TAX_CONFIG: Record<Province, TaxConfig> = {
  // HST provinces
  ON:  { type: 'HST',     lines: [{ name: 'HST', rate: 0.13 }] },
  NB:  { type: 'HST',     lines: [{ name: 'HST', rate: 0.15 }] },
  NS:  { type: 'HST',     lines: [{ name: 'HST', rate: 0.15 }] },
  NL:  { type: 'HST',     lines: [{ name: 'HST', rate: 0.15 }] },
  PEI: { type: 'HST',     lines: [{ name: 'HST', rate: 0.15 }] },
  // GST + PST
  BC:  { type: 'GST+PST', lines: [{ name: 'GST', rate: 0.05 }, { name: 'PST', rate: 0.07 }] },
  MB:  { type: 'GST+PST', lines: [{ name: 'GST', rate: 0.05 }, { name: 'PST', rate: 0.07 }] },
  SK:  { type: 'GST+PST', lines: [{ name: 'GST', rate: 0.05 }, { name: 'PST', rate: 0.06 }] },
  // GST + QST
  QC:  { type: 'GST+QST', lines: [{ name: 'GST', rate: 0.05 }, { name: 'QST', rate: 0.09975 }] },
  // GST only
  AB:  { type: 'GST',     lines: [{ name: 'GST', rate: 0.05 }] },
  NT:  { type: 'GST',     lines: [{ name: 'GST', rate: 0.05 }] },
  NU:  { type: 'GST',     lines: [{ name: 'GST', rate: 0.05 }] },
  YT:  { type: 'GST',     lines: [{ name: 'GST', rate: 0.05 }] },
}

export function getTaxConfig(province: Province): TaxConfig {
  return TAX_CONFIG[province]
}

export function calculateTax(subtotal: number, province: Province): {
  lines: TaxLine[]
  taxAmount: number
  total: number
  taxType: TaxType
} {
  const config = TAX_CONFIG[province]
  const lines: TaxLine[] = config.lines.map(({ name, rate }) => ({
    name,
    rate,
    amount: Math.round(subtotal * rate * 100) / 100,
  }))
  const taxAmount = lines.reduce((sum, l) => sum + l.amount, 0)
  return {
    lines,
    taxAmount: Math.round(taxAmount * 100) / 100,
    total: Math.round((subtotal + taxAmount) * 100) / 100,
    taxType: config.type,
  }
}

export const PROVINCES: { value: Province; label: string }[] = [
  { value: 'AB', label: 'Alberta' },
  { value: 'BC', label: 'British Columbia' },
  { value: 'MB', label: 'Manitoba' },
  { value: 'NB', label: 'New Brunswick' },
  { value: 'NL', label: 'Newfoundland & Labrador' },
  { value: 'NS', label: 'Nova Scotia' },
  { value: 'NT', label: 'Northwest Territories' },
  { value: 'NU', label: 'Nunavut' },
  { value: 'ON', label: 'Ontario' },
  { value: 'PEI', label: 'Prince Edward Island' },
  { value: 'QC', label: 'Québec' },
  { value: 'SK', label: 'Saskatchewan' },
  { value: 'YT', label: 'Yukon' },
]
