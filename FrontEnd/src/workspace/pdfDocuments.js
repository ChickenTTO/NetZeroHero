import { jsPDF } from 'jspdf'
import { autoTable } from 'jspdf-autotable'
import { money, number, dateLabel, STATUS } from './mockData.js'
import { settledQuantity, tradeValue } from './roleActions.js'

const FOREST = [23, 46, 27]
const TEXT = [39, 63, 43]
const MUTED = [98, 114, 88]
const LINE = [219, 228, 210]
const PAPER = [244, 248, 238]
const FONT = 'NotoSans'
const MARGIN = 16
const text = value => Array.from(String(value ?? '').normalize('NFC')).filter(character => {
  const code = character.codePointAt(0)
  return code >= 32 || code === 9 || code === 10 || code === 13
}).join('')

function createDocument({ fonts, orientation, title, profile, exportedAt = new Date() }) {
  const doc = new jsPDF({ orientation, unit: 'mm', format: 'a4', compress: true, putOnlyUsedFonts: true })
  for (const style of ['normal', 'bold']) {
    if (!fonts?.[style]) throw new Error('Thiếu phông chữ tiếng Việt để tạo PDF.')
    const filename = `NotoSans-${style}.ttf`
    doc.addFileToVFS(filename, fonts[style])
    doc.addFont(filename, FONT, style)
  }
  doc.setFont(FONT, 'normal')
  doc.setProperties({ title, author: 'GOM - NetZeroHeroes', subject: 'Dữ liệu mẫu GOM', creator: 'GOM' })
  doc.setLanguage('vi-VN')
  const width = doc.internal.pageSize.getWidth()
  const height = doc.internal.pageSize.getHeight()
  const contentWidth = width - 2 * MARGIN
  const exported = exportedAt.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour12: false })

  function brand() {
    doc.setFillColor(...FOREST)
    doc.rect(0, 0, width, 22, 'F')
    doc.setFont(FONT, 'bold').setFontSize(21).setTextColor(104, 239, 63)
    doc.text('GOM', MARGIN, 14)
    doc.setFont(FONT, 'normal').setFontSize(8).setTextColor(214, 230, 199)
    doc.text('NETZEROHEROES | KẾT NỐI GIÁ TRỊ TUẦN HOÀN', width - MARGIN, 13, { align: 'right' })
  }
  function continuation() {
    brand()
    doc.setFont(FONT, 'bold').setFontSize(12).setTextColor(...TEXT)
    doc.text(title, MARGIN, 33)
  }
  brand()
  doc.setFont(FONT, 'bold').setFontSize(20).setTextColor(...TEXT)
  doc.text(title, MARGIN, 35)
  doc.setFont(FONT, 'normal').setFontSize(9).setTextColor(...MUTED)
  // Account names can be edited and are allowed to wrap.
  const accountText = [profile?.name, profile?.kind].filter(Boolean).join(' | ')
  const accountLines = doc.splitTextToSize(text(accountText), contentWidth)
  doc.text(accountLines, MARGIN, 43)
  const noticeY = 48 + Math.max(0, accountLines.length - 1) * 4
  doc.setFillColor(...PAPER)
  doc.roundedRect(MARGIN, noticeY, contentWidth, 12, 2, 2, 'F')
  doc.setFontSize(8.5).setTextColor(...MUTED)
  doc.text('DỮ LIỆU MẪU - Không có giá trị pháp lý hoặc xác minh môi trường.', MARGIN + 4, noticeY + 7.5)

  function finish() {
    const pages = doc.getNumberOfPages()
    for (let page = 1; page <= pages; page++) {
      doc.setPage(page)
      doc.setDrawColor(...LINE).setLineWidth(0.2)
      doc.line(MARGIN, height - 15, width - MARGIN, height - 15)
      doc.setFont(FONT, 'normal').setFontSize(8).setTextColor(...MUTED)
      doc.text(`GOM | Xuất lúc ${exported} (UTC+7)`, MARGIN, height - 9)
      doc.text(`Trang ${page}/${pages}`, width - MARGIN, height - 9, { align: 'right' })
    }
    return doc
  }
  return { doc, width, height, contentWidth, contentY: noticeY + 21, continuation, finish }
}

function tableOptions(continuation) {
  return {
    theme: 'striped',
    margin: { left: MARGIN, right: MARGIN, top: 44, bottom: 22 },
    styles: { font: FONT, fontStyle: 'normal', fontSize: 8.5, cellPadding: 2.5, overflow: 'linebreak', valign: 'middle', textColor: TEXT, lineColor: LINE, lineWidth: 0.1 },
    headStyles: { fillColor: FOREST, textColor: [255, 255, 255], font: FONT, fontStyle: 'bold', fontSize: 8.5 },
    alternateRowStyles: { fillColor: PAPER },
    showHead: 'everyPage',
    rowPageBreak: 'avoid',
    willDrawPage: ({ pageNumber }) => { if (pageNumber > 1) continuation() },
  }
}

export function createTradeListPdf(trades, { fonts, profile, report = false, period, exportedAt } = {}) {
  const title = report ? 'Báo cáo tuần hoàn' : 'Danh sách giao dịch'
  const { doc, width, contentWidth, contentY, continuation, finish } = createDocument({ fonts, orientation: 'landscape', title, profile, exportedAt })
  const completed = trades.filter(trade => trade.status === 'completed')
  const metrics = [
    ['GIAO DỊCH TRONG DANH SÁCH', `${trades.length} giao dịch`],
    ['KHỐI LƯỢNG HOÀN TẤT', `${number(completed.reduce((sum, trade) => sum + settledQuantity(trade), 0))} tấn`],
    ['GIÁ TRỊ HÀNG ĐÃ HOÀN TẤT', money(completed.reduce((sum, trade) => sum + tradeValue(trade), 0))],
  ]
  const gap = 5, metricWidth = (contentWidth - 2 * gap) / 3
  metrics.forEach(([label, value], index) => {
    const x = MARGIN + index * (metricWidth + gap)
    doc.setFillColor(...PAPER)
    doc.roundedRect(x, contentY, metricWidth, 20, 2, 2, 'F')
    doc.setFont(FONT, 'normal').setFontSize(7.5).setTextColor(...MUTED)
    doc.text(label, x + 4, contentY + 6)
    doc.setFont(FONT, 'bold').setFontSize(13).setTextColor(...TEXT)
    doc.text(value, x + 4, contentY + 14)
  })
  doc.setFont(FONT, 'normal').setFontSize(8.5).setTextColor(...MUTED)
  const scope = period ? `Kỳ báo cáo: ${period.slice(5)}/${period.slice(0, 4)} | ` : ''
  doc.text(`${scope}Phạm vi: các giao dịch theo bộ lọc hiện tại. Giá trị chưa gồm vận chuyển và thuế.`, MARGIN, contentY + 27)
  const columnWidths = [29, 46, 31, 31, 20, 28, 29, 22, 29]
  autoTable(doc, {
    ...tableOptions(continuation),
    startY: contentY + 32,
    tableWidth: width - 2 * MARGIN,
    head: [['Mã giao dịch', 'Vật liệu', 'Bên bán', 'Bên thu mua', 'Khối lượng\n(tấn)', 'Đơn giá\n(đ/tấn)', 'Giá trị hàng\n(đ)', 'Ngày\nthu gom', 'Trạng thái']],
    body: trades.map(trade => [text(trade.id), text(trade.title), text(trade.sellerName), text(trade.buyerName), number(trade.status === 'completed' ? settledQuantity(trade) : trade.quantity), money(trade.price), money(tradeValue(trade)), dateLabel(trade.date), STATUS[trade.status].label]),
    columnStyles: Object.fromEntries(columnWidths.map((cellWidth, index) => [index, { cellWidth, ...(index >= 4 && index <= 6 ? { halign: 'right' } : {}) }])),
  })
  return finish()
}

export function createHandoverPdf(trade, { fonts, profile, exportedAt } = {}) {
  const { doc, height, contentY, continuation, finish } = createDocument({ fonts, orientation: 'portrait', title: 'Biên bản bàn giao', profile, exportedAt })
  autoTable(doc, {
    ...tableOptions(continuation),
    startY: contentY,
    head: [['THÔNG TIN BÀN GIAO', 'NỘI DUNG THỎA THUẬN MẪU']],
    body: [
      ['Mã giao dịch', trade.id], ['Bên bán', trade.sellerName], ['Bên thu mua', trade.buyerName],
      ['Vật liệu', trade.title], ['Khối lượng thỏa thuận', `${number(trade.quantity)} ${trade.unit}`],
      ['Đơn giá thỏa thuận', `${money(trade.price)}/${trade.unit}`], ['Giá trị hàng', money(tradeValue(trade))],
      ...(trade.receipt ? [['Nghiệm thu đầu vào', `${number(trade.receipt.quantity)} ${trade.unit} thực nhận. ${trade.receipt.decision === 'accepted' ? 'Đã tiếp nhận.' : 'Tạm giữ kiểm tra.'} ${trade.receipt.note || ''}`]] : []),
      ['Ngày thu gom', dateLabel(trade.date)], ['Địa điểm tập kết', trade.location],
      ['Trạng thái', STATUS[trade.status].label], ['Ghi chú', trade.note || 'Không có ghi chú bổ sung.'],
      ['Xác nhận', 'Chưa có chữ ký hoặc xác minh thực tế. Đây là biên bản minh họa trong bản dùng thử GOM.'],
    ].map(row => row.map(text)),
    styles: { ...tableOptions(continuation).styles, fontSize: 10, cellPadding: 3 },
    columnStyles: { 0: { cellWidth: 52, fontStyle: 'bold' }, 1: { cellWidth: 126 } },
  })
  let y = doc.lastAutoTable.finalY + 12
  if (y + 18 > height - 22) { doc.addPage(); continuation(); y = 48 }
  doc.setFont(FONT, 'bold').setFontSize(10).setTextColor(...TEXT)
  doc.text('ĐẠI DIỆN BÊN BÁN', 58, y, { align: 'center' })
  doc.text('ĐẠI DIỆN BÊN THU MUA', 152, y, { align: 'center' })
  doc.setFont(FONT, 'normal').setFontSize(9).setTextColor(...MUTED)
  doc.text('(Bản mẫu - chưa ký)', 58, y + 8, { align: 'center' })
  doc.text('(Bản mẫu - chưa ký)', 152, y + 8, { align: 'center' })
  return finish()
}
