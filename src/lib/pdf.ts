// eslint-disable-next-line @typescript-eslint/no-require-imports
const { renderToBuffer } = require('@react-pdf/renderer')
import { createElement } from 'react'
import { QuotePDFDocument } from '@/components/quote/pdf-template'
import type { Quote, User } from '@/types'

export interface PDFClient {
  name: string
  email: string | null
  address: string | null
}

export interface PDFQuoteData {
  quote: Quote & { line_items: NonNullable<Quote['line_items']>; client?: PDFClient }
  user: Pick<User, 'name' | 'business_name' | 'province'>
}

export async function generateQuotePDF(data: PDFQuoteData): Promise<Buffer> {
  const element = createElement(QuotePDFDocument, data)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buffer = await renderToBuffer(element as any)
  return Buffer.from(buffer)
}
