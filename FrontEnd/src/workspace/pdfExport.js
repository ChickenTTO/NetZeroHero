import { createTradeListPdf, createHandoverPdf } from './pdfDocuments.js'

let fontPromise
function loadFonts() {
  if (!fontPromise) {
    const base = import.meta.env.BASE_URL
    fontPromise = Promise.all(['Regular', 'Bold'].map(async weight => {
      const response = await fetch(`${base}fonts/NotoSans-${weight}.ttf`)
      if (!response.ok) throw new Error('Không tải được phông chữ PDF.')
      const bytes = new Uint8Array(await response.arrayBuffer())
      let binary = ''
      for (let start = 0; start < bytes.length; start += 8192) binary += String.fromCharCode(...bytes.subarray(start, start + 8192))
      return btoa(binary)
    })).then(([normal, bold]) => ({ normal, bold })).catch(error => { fontPromise = null; throw error })
  }
  return fontPromise
}

export async function downloadTradesPdf(trades, options) {
  const fonts = await loadFonts()
  const doc = createTradeListPdf(trades, { ...options, fonts })
  const filename = options.report ? `GOM-bao-cao-tuan-hoan-${options.period}-MAU.pdf` : 'GOM-danh-sach-giao-dich-MAU.pdf'
  await doc.save(filename, { returnPromise: true })
}

export async function downloadHandoverPdf(trade, profile) {
  const fonts = await loadFonts()
  const doc = createHandoverPdf(trade, { profile, fonts })
  const safeId = String(trade.id).replace(/[^\w-]/g, '_')
  await doc.save(`GOM-bien-ban-ban-giao-${safeId}-MAU.pdf`, { returnPromise: true })
}
