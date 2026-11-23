import { MATERIALS, makeId, today } from './mockData.js'
import { availability, sum, transitionTrade } from './transactions.js'

export const READINESS = [
  ['sorted', 'Đã phân loại và tách tạp chất'],
  ['packed', 'Đã tập kết / đóng gói phù hợp'],
  ['access', 'Đã chuẩn bị đường vào và chỗ bốc xếp'],
  ['contact', 'Đã bố trí người bàn giao tại điểm hẹn'],
]
export const EXCHANGE_PRODUCTS = [
  { id: 'compost', title: 'Phân hữu cơ', material: 'agriculture', unit: 'bao 25 kg', price: 350000, icon: 'leaf', description: 'Phương án đổi phụ phẩm nông nghiệp lấy đầu vào cho vụ tiếp theo.' },
  { id: 'brick', title: 'Gạch không nung tái chế', material: 'construction', unit: 'pallet', price: 1800000, icon: 'building', description: 'Phương án đưa vật liệu xây dựng trở lại vòng sử dụng.' },
]
export const settledQuantity = trade => trade.receipt?.decision === 'accepted' ? trade.receipt.quantity : trade.quantity
export const tradeValue = trade => (trade.status === 'completed' ? settledQuantity(trade) : trade.quantity) * trade.price
export const readyForPickup = trade => READINESS.every(([key]) => trade.readiness?.[key])

export function demandProgress(data, demand) {
  const trades = data.trades.filter(trade => trade.buyer === demand.owner && trade.demandId === demand.id)
  return {
    confirmed: sum(trades.filter(trade => ['scheduled', 'collecting', 'completed'].includes(trade.status)), trade => trade.status === 'completed' ? settledQuantity(trade) : trade.quantity),
    received: sum(trades.filter(trade => trade.status === 'completed'), settledQuantity),
  }
}

export function evaluateSupply(data, listing, demand) {
  if (!demand) return { matches: true, reasons: [] }
  const reasons = []
  if (listing.material !== demand.material) reasons.push('Khác nhóm vật liệu')
  if (listing.status !== 'active' || availability(data, listing) <= 0) reasons.push('Chưa có khối lượng khả dụng')
  if (listing.price > demand.maxPrice) reasons.push('Vượt đơn giá tối đa')
  if (listing.date > demand.deadline) reasons.push('Sẵn sàng sau hạn cần hàng')
  if (!listing.location.toLocaleLowerCase('vi').includes(demand.location.toLocaleLowerCase('vi'))) reasons.push('Ngoài khu vực cần thu mua')
  if (listing.material === demand.material) {
    for (const [key, limit, label] of [['moisture', demand.maxMoisture, 'Độ ẩm'], ['impurity', demand.maxImpurity, 'Tạp chất']]) {
      if (limit != null && (listing[key] == null || listing[key] > limit)) reasons.push(listing[key] == null ? `Chưa khai báo ${label.toLocaleLowerCase('vi')}` : `${label} vượt ngưỡng`)
    }
    if (demand.minSoh != null && (listing.soh == null || listing.soh < demand.minSoh)) reasons.push(listing.soh == null ? 'Chưa khai báo SoH' : 'SoH thấp hơn yêu cầu')
  }
  return { matches: reasons.length === 0, reasons }
}

export function saveDemand(data, user, values, id) {
  if (user.role !== 'buyer') throw new Error('Chỉ bên thu mua được lập nhu cầu nguyên liệu.')
  const existing = id && data.demands.find(demand => demand.id === id && demand.owner === user.id)
  if (id && !existing) throw new Error('Không tìm thấy nhu cầu của bạn.')
  if (!MATERIALS[values.material] || !values.title?.trim() || !values.location?.trim()) throw new Error('Vui lòng nhập tên nhu cầu, loại vật liệu và khu vực.')
  if (!Number.isFinite(values.quantity) || values.quantity <= 0 || !Number.isFinite(values.maxPrice) || values.maxPrice <= 0) throw new Error('Khối lượng và đơn giá tối đa phải lớn hơn 0.')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(values.deadline) || values.deadline < today()) throw new Error('Hạn cần hàng phải từ hôm nay trở đi.')
  for (const key of ['maxMoisture', 'maxImpurity', 'minSoh']) if (values[key] != null && (!Number.isFinite(values[key]) || values[key] < 0 || values[key] > 100)) throw new Error('Chỉ tiêu chất lượng phải từ 0 đến 100%.')
  if (existing && demandProgress(data, existing).confirmed > values.quantity) throw new Error('Khối lượng mục tiêu không được thấp hơn lượng đã xác nhận.')
  if (existing && existing.material !== values.material && data.trades.some(trade => trade.demandId === id && trade.status !== 'declined')) throw new Error('Nhu cầu đã có đề nghị, không thể đổi nhóm vật liệu.')
  const demand = { ...existing, ...values, id: existing?.id || makeId('NC'), owner: user.id, status: existing?.status || 'active' }
  return { ...data, demands: existing ? data.demands.map(item => item.id === id ? demand : item) : [demand, ...data.demands] }
}

export function toggleDemand(data, user, id) {
  if (user.role !== 'buyer' || !data.demands.some(demand => demand.id === id && demand.owner === user.id)) throw new Error('Bạn không thể thay đổi nhu cầu này.')
  return { ...data, demands: data.demands.map(demand => demand.id === id ? { ...demand, status: demand.status === 'active' ? 'paused' : 'active' } : demand) }
}

export function updateReadiness(data, user, id, key, checked) {
  const trade = data.trades.find(item => item.id === id)
  if (user.role !== 'seller' || trade?.seller !== user.id || trade.status !== 'scheduled' || !READINESS.some(([name]) => name === key)) throw new Error('Chỉ bên bán được chuẩn bị giao dịch đã lên lịch.')
  return { ...data, trades: data.trades.map(item => item.id === id ? { ...item, readiness: { ...item.readiness, [key]: Boolean(checked) } } : item) }
}

export function handOver(data, user, id) {
  const trade = data.trades.find(item => item.id === id)
  if (!trade || !readyForPickup(trade)) throw new Error('Hoàn thành checklist chuẩn bị trước khi xác nhận bàn giao.')
  return transitionTrade(data, user, id, 'collecting')
}

export function recordReceipt(data, user, id, values) {
  const trade = data.trades.find(item => item.id === id)
  if (user.role !== 'buyer' || trade?.buyer !== user.id || trade.status !== 'collecting') throw new Error('Chỉ bên thu mua được nghiệm thu hàng đang vận chuyển đến mình.')
  const quantity = Number(values.quantity)
  if (!Number.isFinite(quantity) || quantity <= 0 || quantity > trade.quantity) throw new Error('Khối lượng thực nhận phải lớn hơn 0 và không vượt khối lượng đã bàn giao.')
  if (!['hold', 'accepted'].includes(values.decision)) throw new Error('Vui lòng chọn kết quả nghiệm thu.')
  if ((!values.note?.trim()) && (values.decision === 'hold' || Math.abs(quantity - trade.quantity) > 0.00001)) throw new Error('Cần ghi lý do tạm giữ hoặc chênh lệch khối lượng.')
  const receipt = { quantity, decision: values.decision, note: values.note?.trim() || '', recordedAt: new Date().toISOString(), inspector: user.contact }
  const next = values.decision === 'accepted' ? transitionTrade(data, user, id, 'completed') : data
  return { ...next, trades: next.trades.map(item => item.id === id ? { ...item, receipt } : item) }
}

export function exchangeBalance(data, user, material) {
  const total = sum(data.trades.filter(trade => trade.seller === user.id && trade.status === 'completed' && trade.material === material), tradeValue)
  const reserved = sum(data.exchanges.filter(item => item.owner === user.id && item.material === material && item.status === 'requested'), item => item.value)
  return { total, reserved, available: Math.max(0, total - reserved) }
}

export function requestExchange(data, user, productId, quantity) {
  const product = EXCHANGE_PRODUCTS.find(item => item.id === productId)
  if (user.role !== 'seller' || !product) throw new Error('Phương án đổi vật liệu chỉ dành cho bên bán.')
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 1000) throw new Error('Số lượng đổi phải là số nguyên từ 1 đến 1.000.')
  const value = quantity * product.price
  if (exchangeBalance(data, user, product.material).available < value) throw new Error('Giá trị bàn giao cùng nhóm vật liệu chưa đủ để tạo phương án này.')
  return { ...data, exchanges: [{ id: makeId('DOI'), owner: user.id, productId, title: product.title, material: product.material, quantity, unit: product.unit, value, date: today(), status: 'requested' }, ...data.exchanges] }
}

export function cancelExchange(data, user, id) {
  if (user.role !== 'seller' || !data.exchanges.some(item => item.id === id && item.owner === user.id && item.status === 'requested')) throw new Error('Không thể hủy phương án này.')
  return { ...data, exchanges: data.exchanges.map(item => item.id === id ? { ...item, status: 'cancelled' } : item) }
}
