// Browser-only demo repository. These are fictional accounts and organizations.
export const DEMO_ACCOUNTS = [
  { id: 'buyer', identifier: '0100000001', password: 'Dat@2005', role: 'buyer', name: 'Nguyễn Thành Đạt', shortName: 'Nguyễn Thành Đạt (Doanh Nghiệp)', kind: 'Doanh nghiệp thu mua', contact: 'Nguyễn Thành Đạt', location: 'Hà Nội', email: 'thumua@example.com' },
  { id: 'seller', identifier: '0100000002', password: 'Dat@2005', role: 'seller', name: 'Nguyễn Thành Đạt', shortName: 'Nguyễn Thành Đạt (Cá Nhân)', kind: 'Hợp tác xã', contact: 'Nguyễn Thành Đạt', location: 'Hà Nội', email: 'benban@example.com' },
]

export const MATERIALS = {
  construction: { label: 'Phế thải xây dựng', icon: 'building', short: 'Xây dựng', color: 'stone' },
  agriculture: { label: 'Phụ phẩm nông nghiệp', icon: 'leaf', short: 'Nông nghiệp', color: 'green' },
  battery: { label: 'Pin & ắc quy', icon: 'battery', short: 'Pin & ắc quy', color: 'blue' },
}
export const STATUS = {
  pending: { label: 'Chờ xác nhận', tone: 'amber', step: 0 },
  scheduled: { label: 'Đã lên lịch', tone: 'blue', step: 1 },
  collecting: { label: 'Đang vận chuyển', tone: 'blue', step: 2 },
  completed: { label: 'Hoàn tất', tone: 'green', step: 3 },
  declined: { label: 'Đã từ chối', tone: 'gray', step: -1 },
}
export const money = value => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value)
export const number = value => new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2 }).format(value)
export const dateLabel = value => new Date(value + 'T12:00:00+07:00').toLocaleDateString('vi-VN')
export const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
export const makeId = prefix => `${prefix}-${(globalThis.crypto?.randomUUID?.().slice(0, 8) || Date.now().toString(36)).toUpperCase()}`

const seed = {
  version: 1,
  nameRevision: 1,
  roleFeaturesVersion: 1,
  demands: [
    { id: 'NC-2601', owner: 'buyer', title: 'Nguyên liệu cho dây chuyền sinh khối', material: 'agriculture', quantity: 24, maxPrice: 1150000, maxMoisture: 15, maxImpurity: 4, location: 'Hà Nội', deadline: '2026-11-30', status: 'active' },
    { id: 'NC-2602', owner: 'buyer', title: 'Bê tông đầu vào cho tái chế', material: 'construction', quantity: 60, maxPrice: 110000, maxImpurity: 6, location: 'Hà Nội', deadline: '2026-11-30', status: 'active' },
  ],
  exchanges: [],
  profiles: Object.fromEntries(DEMO_ACCOUNTS.map(({ password: _password, ...account }) => [account.id, account])),
  listings: [
    { id: 'VL-2601', owner: 'seller', title: 'Rơm cuộn khô sau thu hoạch', material: 'agriculture', quantity: 12, unit: 'tấn', price: 850000, location: 'Đông Anh, Hà Nội', date: '2026-11-26', moisture: 14, impurity: 3, status: 'active', description: 'Rơm đã cuộn, tập kết tại kho hợp tác xã. Đường vào phù hợp xe tải 5 tấn. Ưu tiên thu gom trong buổi sáng.', seller: 'Nguyễn Thành Đạt' },
    { id: 'VL-2602', owner: 'partner-1', title: 'Bê tông phá dỡ đã phân loại', material: 'construction', quantity: 36, unit: 'tấn', price: 95000, location: 'Long Biên, Hà Nội', date: '2026-11-27', impurity: 5, status: 'active', description: 'Bê tông đã tách sắt, tập kết tại công trường. Có thiết bị hỗ trợ bốc xếp.', seller: 'Nguyễn Thành Đạt' },
    { id: 'VL-2603', owner: 'partner-2', title: 'Pin LFP từ xe điện', material: 'battery', quantity: 0.8, unit: 'tấn', price: 18000000, location: 'Gia Lâm, Hà Nội', date: '2026-11-28', soh: 68, code: 'LFP-48V', status: 'active', description: 'Có hồ sơ mã pin. Cần đối tác đủ điều kiện tiếp nhận; thông số SoH do bên bán khai báo, chưa xác minh.', seller: 'Nguyễn Thành Đạt' },
    { id: 'VL-2604', owner: 'seller', title: 'Trấu sạch tại kho Nguyễn Thành Đạt', material: 'agriculture', quantity: 8, unit: 'tấn', price: 1100000, location: 'Sóc Sơn, Hà Nội', date: '2026-11-25', moisture: 12, impurity: 2, status: 'active', description: 'Trấu từ xưởng xay xát, bảo quản trong kho có mái che. Có thể thu gom theo đợt.', seller: 'Nguyễn Thành Đạt' },
    { id: 'VL-2605', owner: 'partner-3', title: 'Gạch vụn từ công trình cải tạo', material: 'construction', quantity: 18, unit: 'tấn', price: 70000, location: 'Nam Từ Liêm, Hà Nội', date: '2026-11-26', impurity: 8, status: 'active', description: 'Đã phân loại sơ bộ, phù hợp làm nguyên liệu tái chế sau sàng lọc.', seller: 'Nguyễn Thành Đạt' },
    { id: 'VL-2606', owner: 'seller', title: 'Vỏ ngô khô, đóng bao', material: 'agriculture', quantity: 4.5, unit: 'tấn', price: 650000, location: 'Đông Anh, Hà Nội', date: '2026-11-29', moisture: 16, impurity: 4, status: 'paused', description: 'Đóng bao tại điểm tập kết, đang chờ xác nhận lịch thu hoạch.', seller: 'Nguyễn Thành Đạt' },
  ],
  trades: [
    { id: 'GOM-1028', listingId: 'VL-2601', buyer: 'buyer', buyerName: 'Nguyễn Thành Đạt', seller: 'seller', sellerName: 'Nguyễn Thành Đạt', title: 'Rơm cuộn khô sau thu hoạch', material: 'agriculture', quantity: 3, unit: 'tấn', price: 850000, date: '2026-11-26', location: 'Đông Anh, Hà Nội', status: 'pending', note: 'Đề nghị thu gom buổi sáng. Thanh toán sau đối soát khối lượng.' },
    { id: 'GOM-1027', listingId: 'VL-2604', buyer: 'buyer', buyerName: 'Nguyễn Thành Đạt', seller: 'seller', sellerName: 'Nguyễn Thành Đạt', title: 'Trấu sạch tại kho Nguyễn Thành Đạt', material: 'agriculture', quantity: 5, unit: 'tấn', price: 1100000, date: '2026-11-25', location: 'Sóc Sơn, Hà Nội', status: 'scheduled', note: 'Xe tải 5 tấn, khung giờ 08:00–10:00.' },
    { id: 'GOM-1026', listingId: 'VL-2602', buyer: 'buyer', buyerName: 'Nguyễn Thành Đạt', seller: 'partner-1', sellerName: 'Nguyễn Thành Đạt', title: 'Bê tông đã phân loại', material: 'construction', quantity: 24, unit: 'tấn', price: 95000, date: '2026-11-23', location: 'Long Biên, Hà Nội', status: 'collecting', note: 'Đã rời điểm tập kết. Chờ nhà máy xác nhận khối lượng thực nhận.' },
    { id: 'GOM-1025', listingId: 'VL-2601', buyer: 'buyer', buyerName: 'Nguyễn Thành Đạt', seller: 'seller', sellerName: 'Nguyễn Thành Đạt', title: 'Rơm khô vụ mùa', material: 'agriculture', quantity: 8, unit: 'tấn', price: 800000, date: '2026-11-20', location: 'Đông Anh, Hà Nội', status: 'completed', note: 'Hai bên đã đối soát khối lượng trong kịch bản mẫu.' },
    { id: 'GOM-1024', listingId: 'VL-2602', buyer: 'buyer', buyerName: 'Nguyễn Thành Đạt', seller: 'partner-1', sellerName: 'Nguyễn Thành Đạt', title: 'Bê tông công trình', material: 'construction', quantity: 32, unit: 'tấn', price: 90000, date: '2026-11-18', location: 'Long Biên, Hà Nội', status: 'completed', note: 'Đã bàn giao và đối soát trong kịch bản mẫu.' },
    { id: 'GOM-1023', listingId: 'VL-2603', buyer: 'buyer', buyerName: 'Nguyễn Thành Đạt', seller: 'partner-2', sellerName: 'Nguyễn Thành Đạt', title: 'Pin LFP đã qua sử dụng', material: 'battery', quantity: 0.6, unit: 'tấn', price: 17000000, date: '2026-11-14', location: 'Gia Lâm, Hà Nội', status: 'completed', note: 'Hồ sơ minh họa, không xác nhận điều kiện xử lý thực tế.' },
    { id: 'GOM-1022', listingId: 'VL-2604', buyer: 'partner-buyer', buyerName: 'Nguyễn Thành Đạt', seller: 'seller', sellerName: 'Nguyễn Thành Đạt', title: 'Trấu sau xay xát', material: 'agriculture', quantity: 6, unit: 'tấn', price: 1000000, date: '2026-11-12', location: 'Sóc Sơn, Hà Nội', status: 'completed', note: 'Đã bàn giao trong kịch bản mẫu.' },
    { id: 'GOM-1021', listingId: 'VL-2604', buyer: 'partner-buyer', buyerName: 'Nguyễn Thành Đạt', seller: 'seller', sellerName: 'Nguyễn Thành Đạt', title: 'Trấu sạch tại kho Nguyễn Thành Đạt', material: 'agriculture', quantity: 2, unit: 'tấn', price: 1050000, date: '2026-11-27', location: 'Sóc Sơn, Hà Nội', status: 'pending', note: 'Mong nhận thông tin về điều kiện bốc xếp tại kho.' },
  ],
  saved: [],
}

seed.trades = seed.trades.map(trade => ({ ...trade, ...(trade.buyer === 'buyer' && trade.material !== 'battery' ? { demandId: trade.material === 'agriculture' ? 'NC-2601' : 'NC-2602' } : {}) }))

const DATA_KEY = 'gom.workspace.v1'
const SESSION_KEY = 'gom.demo.session'

function migrateDisplayNames(data) {
  const displayName = 'Nguyễn Thành Đạt'
  // Include former short names so titles and notes from saved demo sessions update too.
  const aliases = [...new Set([
    'An Phát', 'An Hòa', 'Nguyễn Minh Anh', 'Trần Hoài An',
    ...Object.values(data.profiles).flatMap(profile => [profile.name, profile.shortName, profile.contact]),
    ...data.listings.map(listing => listing.seller),
    ...data.trades.flatMap(trade => [trade.buyerName, trade.sellerName]),
  ])].filter(name => typeof name === 'string' && name.length > 2 && name !== displayName).sort((a, b) => b.length - a.length)
  const renameText = text => typeof text === 'string' ? aliases.reduce((value, alias) => value.replaceAll(alias, displayName), text) : text
  return {
    ...data,
    nameRevision: 1,
    profiles: Object.fromEntries(Object.entries(data.profiles).map(([id, profile]) => [id, { ...profile, name: displayName, shortName: displayName, contact: displayName }])),
    listings: data.listings.map(listing => ({ ...listing, seller: displayName, title: renameText(listing.title), description: renameText(listing.description) })),
    trades: data.trades.map(trade => ({ ...trade, buyerName: displayName, sellerName: displayName, title: renameText(trade.title), note: renameText(trade.note) })),
  }
}

export function readStore() {
  try {
    const data = JSON.parse(localStorage.getItem(DATA_KEY))
    if (data?.version === 1 && Array.isArray(data.listings) && Array.isArray(data.trades) && data.profiles?.buyer && data.profiles?.seller && Array.isArray(data.saved)) {
      let migrated = data.nameRevision === 1 ? data : migrateDisplayNames(data)
      if (migrated.roleFeaturesVersion !== 1) {
        migrated = { ...migrated, roleFeaturesVersion: 1, demands: structuredClone(seed.demands), exchanges: [], trades: migrated.trades.map(trade => ({ ...trade, ...(seed.trades.find(item => item.id === trade.id)?.demandId ? { demandId: seed.trades.find(item => item.id === trade.id).demandId } : {}) })) }
      }
      if (migrated === data) return data
      writeStore(migrated)
      return migrated
    }
  } catch { /* Use the seed if storage is unavailable or damaged. */ }
  return structuredClone(seed)
}
export function writeStore(data) {
  try { localStorage.setItem(DATA_KEY, JSON.stringify(data)); return true } catch { return false }
}
export function getSession() {
  try { return DEMO_ACCOUNTS.find(account => account.id === JSON.parse(sessionStorage.getItem(SESSION_KEY))?.id) || null } catch { return null }
}
export function signIn(identifier, password) {
  const account = DEMO_ACCOUNTS.find(item => item.identifier === identifier.trim() && item.password === password)
  if (account) { try { sessionStorage.setItem(SESSION_KEY, JSON.stringify({ id: account.id })) } catch { /* Current-tab login still works. */ } }
  return account || null
}
export function signOut() { try { sessionStorage.removeItem(SESSION_KEY) } catch { /* No session to remove. */ } }
export const rolePath = role => role === 'buyer' ? 'thu-mua' : 'ben-ban'
