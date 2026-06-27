import { describe, expect, it } from 'vitest'
import { calculateTax, type Province } from './tax'

// Expected tax on a $100 subtotal, per CRA rates as of 2026. The lib rounds each
// tax line to cents, so QC's QST (9.975%) rounds 9.975 -> 9.98 -> total tax 14.98.
const cases: { province: Province; taxType: string; tax: number; total: number }[] = [
  { province: 'ON',  taxType: 'HST',     tax: 13.0,  total: 113.0 },
  { province: 'NB',  taxType: 'HST',     tax: 15.0,  total: 115.0 },
  { province: 'NS',  taxType: 'HST',     tax: 14.0,  total: 114.0 }, // 14% since 2025-04-01
  { province: 'NL',  taxType: 'HST',     tax: 15.0,  total: 115.0 },
  { province: 'PEI', taxType: 'HST',     tax: 15.0,  total: 115.0 },
  { province: 'BC',  taxType: 'GST+PST', tax: 12.0,  total: 112.0 }, // 5 + 7
  { province: 'MB',  taxType: 'GST+PST', tax: 12.0,  total: 112.0 }, // 5 + 7
  { province: 'SK',  taxType: 'GST+PST', tax: 11.0,  total: 111.0 }, // 5 + 6
  { province: 'QC',  taxType: 'GST+QST', tax: 14.98, total: 114.98 }, // 5 + 9.975->9.98
  { province: 'AB',  taxType: 'GST',     tax: 5.0,   total: 105.0 },
  { province: 'NT',  taxType: 'GST',     tax: 5.0,   total: 105.0 },
  { province: 'NU',  taxType: 'GST',     tax: 5.0,   total: 105.0 },
  { province: 'YT',  taxType: 'GST',     tax: 5.0,   total: 105.0 },
]

describe('calculateTax — $100 subtotal, all 13 provinces', () => {
  for (const c of cases) {
    it(`${c.province} -> ${c.taxType} ${c.tax}`, () => {
      const r = calculateTax(100, c.province)
      expect(r.taxType).toBe(c.taxType)
      expect(r.taxAmount).toBeCloseTo(c.tax, 2)
      expect(r.total).toBeCloseTo(c.total, 2)
    })
  }
})

describe('calculateTax — rounding & edges', () => {
  it('rounds tax to cents (ON on $99.99)', () => {
    const r = calculateTax(99.99, 'ON') // 99.99*0.13 = 12.9987 -> 13.00
    expect(r.taxAmount).toBeCloseTo(13.0, 2)
    expect(r.total).toBeCloseTo(112.99, 2)
  })
  it('QC computes QST on the pre-tax subtotal, not compounded ($200)', () => {
    const r = calculateTax(200, 'QC') // GST 10.00 + QST 19.95 = 29.95
    expect(r.taxAmount).toBeCloseTo(29.95, 2)
  })
  it('zero subtotal -> zero tax', () => {
    const r = calculateTax(0, 'ON')
    expect(r.taxAmount).toBe(0)
    expect(r.total).toBe(0)
  })
})
