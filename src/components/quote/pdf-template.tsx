import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer'
import type { Quote, User } from '@/types'

// Register a clean system font
Font.registerHyphenationCallback(word => [word])

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#111827',
    paddingTop: 48,
    paddingBottom: 64,
    paddingHorizontal: 48,
    backgroundColor: '#ffffff',
  },
  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 36 },
  businessName: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: '#111827' },
  businessSub: { fontSize: 9, color: '#6b7280', marginTop: 2 },
  quoteLabel: { fontSize: 22, fontFamily: 'Helvetica-Bold', color: '#2563eb', textAlign: 'right' },
  quoteNumber: { fontSize: 10, color: '#6b7280', textAlign: 'right', marginTop: 2 },
  // Meta section
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 28 },
  metaBlock: { flex: 1 },
  metaLabel: { fontSize: 8, color: '#9ca3af', textTransform: 'uppercase', marginBottom: 3, letterSpacing: 0.5 },
  metaValue: { fontSize: 10, color: '#111827' },
  // Divider
  divider: { borderBottomWidth: 1, borderBottomColor: '#e5e7eb', marginBottom: 16 },
  // Table
  tableHeader: { flexDirection: 'row', backgroundColor: '#f9fafb', paddingVertical: 7, paddingHorizontal: 10, borderRadius: 4, marginBottom: 2 },
  tableHeaderText: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.3 },
  tableRow: { flexDirection: 'row', paddingVertical: 8, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  tableRowAlt: { backgroundColor: '#fafafa' },
  col_desc: { flex: 5 },
  col_qty: { flex: 1.2, textAlign: 'right' },
  col_price: { flex: 1.8, textAlign: 'right' },
  col_total: { flex: 1.8, textAlign: 'right' },
  cellText: { fontSize: 10, color: '#374151' },
  // Totals
  totalsSection: { marginTop: 12, alignItems: 'flex-end' },
  totalRow: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 4, width: 220 },
  totalLabel: { flex: 1, fontSize: 10, color: '#6b7280', textAlign: 'right', paddingRight: 16 },
  totalValue: { width: 80, fontSize: 10, color: '#374151', textAlign: 'right' },
  grandTotalRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 6, width: 220, borderTopWidth: 1.5, borderTopColor: '#111827', paddingTop: 6 },
  grandTotalLabel: { flex: 1, fontSize: 12, fontFamily: 'Helvetica-Bold', color: '#111827', textAlign: 'right', paddingRight: 16 },
  grandTotalValue: { width: 80, fontSize: 12, fontFamily: 'Helvetica-Bold', color: '#111827', textAlign: 'right' },
  // Footer
  footer: { position: 'absolute', bottom: 32, left: 48, right: 48 },
  footerText: { fontSize: 8, color: '#9ca3af', textAlign: 'center' },
  // Notes
  notes: { marginTop: 28, padding: 12, backgroundColor: '#f9fafb', borderRadius: 4 },
  notesLabel: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 4 },
  notesText: { fontSize: 9, color: '#6b7280', lineHeight: 1.4 },
})

interface PDFClient {
  name: string
  email: string | null
  address: string | null
}

interface Props {
  quote: Quote & {
    line_items: NonNullable<Quote['line_items']>
    client?: PDFClient
  }
  user: Pick<User, 'name' | 'business_name' | 'province'>
}

export function QuotePDFDocument({ quote, user }: Props) {
  const businessName = user.business_name ?? user.name ?? 'Your Business'
  const issueDate = new Date(quote.created_at).toLocaleDateString('en-CA')
  const expiryDate = quote.expires_at ?? '—'

  // Reconstruct tax lines for display
  const taxLines = getTaxLines(quote.subtotal, quote.tax_type, quote.tax_amount)

  return (
    <Document title={`${quote.quote_number} — ${quote.title}`} author={businessName}>
      <Page size="LETTER" style={styles.page}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.businessName}>{businessName}</Text>
            {user.province && <Text style={styles.businessSub}>{user.province}, Canada</Text>}
          </View>
          <View>
            <Text style={styles.quoteLabel}>QUOTE</Text>
            <Text style={styles.quoteNumber}>{quote.quote_number}</Text>
          </View>
        </View>

        {/* Meta */}
        <View style={styles.metaRow}>
          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>Bill To</Text>
            {quote.client ? (
              <>
                <Text style={styles.metaValue}>{quote.client.name}</Text>
                {quote.client.address && <Text style={{ ...styles.metaValue, color: '#6b7280', fontSize: 9 }}>{quote.client.address}</Text>}
                {quote.client.email && <Text style={{ ...styles.metaValue, color: '#6b7280', fontSize: 9 }}>{quote.client.email}</Text>}
              </>
            ) : (
              <Text style={styles.metaValue}>—</Text>
            )}
          </View>
          <View style={{ ...styles.metaBlock, alignItems: 'flex-end' }}>
            <Text style={styles.metaLabel}>Date Issued</Text>
            <Text style={styles.metaValue}>{issueDate}</Text>
            <Text style={{ ...styles.metaLabel, marginTop: 10 }}>Valid Until</Text>
            <Text style={styles.metaValue}>{expiryDate}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Title */}
        <Text style={{ fontSize: 13, fontFamily: 'Helvetica-Bold', marginBottom: 14, color: '#111827' }}>
          {quote.title}
        </Text>

        {/* Table header */}
        <View style={styles.tableHeader}>
          <View style={styles.col_desc}><Text style={styles.tableHeaderText}>Description</Text></View>
          <View style={styles.col_qty}><Text style={{ ...styles.tableHeaderText, textAlign: 'right' }}>Qty</Text></View>
          <View style={styles.col_price}><Text style={{ ...styles.tableHeaderText, textAlign: 'right' }}>Unit Price</Text></View>
          <View style={styles.col_total}><Text style={{ ...styles.tableHeaderText, textAlign: 'right' }}>Total</Text></View>
        </View>

        {/* Line items */}
        {quote.line_items.map((item, i) => (
          <View key={item.id} style={[styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}]}>
            <View style={styles.col_desc}><Text style={styles.cellText}>{item.description}</Text></View>
            <View style={styles.col_qty}><Text style={{ ...styles.cellText, textAlign: 'right' }}>{item.quantity}</Text></View>
            <View style={styles.col_price}><Text style={{ ...styles.cellText, textAlign: 'right' }}>${Number(item.unit_price).toFixed(2)}</Text></View>
            <View style={styles.col_total}><Text style={{ ...styles.cellText, textAlign: 'right' }}>${Number(item.line_total).toFixed(2)}</Text></View>
          </View>
        ))}

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>${Number(quote.subtotal).toFixed(2)}</Text>
          </View>
          {taxLines.map(line => (
            <View key={line.name} style={styles.totalRow}>
              <Text style={styles.totalLabel}>{line.name} ({(line.rate * 100).toFixed(line.rate === 0.09975 ? 3 : 0)}%)</Text>
              <Text style={styles.totalValue}>${line.amount.toFixed(2)}</Text>
            </View>
          ))}
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>Total (CAD)</Text>
            <Text style={styles.grandTotalValue}>${Number(quote.total).toFixed(2)}</Text>
          </View>
        </View>

        {/* Notes */}
        {quote.description_raw && (
          <View style={styles.notes}>
            <Text style={styles.notesLabel}>Notes</Text>
            <Text style={styles.notesText}>{quote.description_raw}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            This quote is valid until {expiryDate}. Thank you for your business.
          </Text>
        </View>

      </Page>
    </Document>
  )
}

function getTaxLines(subtotal: number, taxType: string | null, totalTax: number) {
  if (!taxType || totalTax === 0) return []
  const configs: Record<string, { name: string; rate: number }[]> = {
    'HST':     [{ name: 'HST', rate: totalTax / subtotal }],
    'GST':     [{ name: 'GST', rate: 0.05 }],
    'GST+PST': [{ name: 'GST', rate: 0.05 }, { name: 'PST', rate: Math.max(0, totalTax / subtotal - 0.05) }],
    'GST+QST': [{ name: 'GST', rate: 0.05 }, { name: 'QST', rate: 0.09975 }],
  }
  const lines = configs[taxType] ?? []
  return lines.map(l => ({ name: l.name, rate: l.rate, amount: Math.round(subtotal * l.rate * 100) / 100 }))
}
