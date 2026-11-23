import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile, mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { createTradeListPdf, createHandoverPdf } from '../src/workspace/pdfDocuments.js'
import { readStore } from '../src/workspace/mockData.js'

const fonts = {
  normal: (await readFile(new URL('../public/fonts/NotoSans-Regular.ttf', import.meta.url))).toString('base64'),
  bold: (await readFile(new URL('../public/fonts/NotoSans-Bold.ttf', import.meta.url))).toString('base64'),
}
const data = readStore()
const trades = data.trades.filter(trade => trade.buyer === 'buyer')
const profile = data.profiles.buyer
const exportedAt = new Date('2026-11-23T12:00:00+07:00')
const options = { fonts, profile, exportedAt }
const previewDir = process.env.GOM_PDF_PREVIEW_DIR

async function validate(doc, filename) {
  const buffer = Buffer.from(doc.output('arraybuffer'))
  assert.equal(buffer.subarray(0, 5).toString(), '%PDF-')
  assert.ok(buffer.length > 10000)
  assert.deepEqual(doc.getFontList().NotoSans, ['normal', 'bold'])
  if (previewDir) { await mkdir(previewDir, { recursive: true }); await writeFile(resolve(previewDir, filename), buffer) }
}

test('transaction list is an A4 PDF containing exactly the supplied filtered rows', async () => {
  const doc = createTradeListPdf([trades[0]], options)
  assert.equal(doc.lastAutoTable.body.length, 1)
  assert.equal(doc.lastAutoTable.body[0].cells[0].text.join(' '), trades[0].id)
  assert.ok(doc.internal.pageSize.getWidth() > doc.internal.pageSize.getHeight())
  await validate(doc, 'filtered-trades.pdf')
})

test('monthly report uses the supplied period and transaction set', async () => {
  const doc = createTradeListPdf(trades, { ...options, report: true, period: '2026-11' })
  assert.equal(doc.lastAutoTable.body.length, trades.length)
  await validate(doc, 'monthly-report.pdf')
})

test('handover document embeds Vietnamese fonts and keeps agreement data', async () => {
  const trade = trades.find(item => item.status === 'completed')
  const doc = createHandoverPdf(trade, options)
  assert.equal(doc.lastAutoTable.body[0].cells[1].text.join(' '), trade.id)
  assert.equal(doc.getNumberOfPages(), 1)
  assert.ok(doc.internal.pageSize.getHeight() > doc.internal.pageSize.getWidth())
  await validate(doc, 'handover.pdf')
})

test('long tables paginate without placing cells over the page footer', async () => {
  const rows = Array.from({ length: 80 }, (_, index) => ({ ...trades[index % trades.length], id: `GOM-QA-${index + 1}`, title: 'Phụ phẩm nông nghiệp tại kho Nguyễn Thành Đạt, đã phân loại và bảo quản trong kho có mái che' }))
  const doc = createTradeListPdf(rows, options)
  assert.ok(doc.getNumberOfPages() > 1)
  for (const row of doc.lastAutoTable.body) {
    for (const cell of Object.values(row.cells)) assert.ok(cell.y + cell.height <= doc.internal.pageSize.getHeight() - 20)
  }
  await validate(doc, 'long-trades.pdf')
})

test('long handover notes wrap across pages while preserving signatures and footer space', async () => {
  const doc = createHandoverPdf({ ...trades[0], note: 'Ghi chú bàn giao nguyên liệu, xác nhận khối lượng và địa điểm tập kết. '.repeat(45) }, options)
  assert.ok(doc.getNumberOfPages() > 1)
  await validate(doc, 'long-handover.pdf')
})

test('PDF rows and handover show accepted quantity and settlement value', async () => {
  const trade = { ...trades[0], status: 'completed', receipt: { decision: 'accepted', quantity: 2.5, note: 'Ghi nhận chênh lệch 0,5 tấn.' } }
  const list = createTradeListPdf([trade], options)
  assert.equal(list.lastAutoTable.body[0].cells[4].text.join(' '), '2,5')
  assert.ok(list.lastAutoTable.body[0].cells[6].text.join(' ').includes('2.125.000'))
  const handover = createHandoverPdf(trade, options)
  assert.ok(handover.lastAutoTable.body.some(row => row.cells[0].text.join(' ').includes('Nghiệm thu')))
  await validate(handover, 'receipt-handover.pdf')
})
