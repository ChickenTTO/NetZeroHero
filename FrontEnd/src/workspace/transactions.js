// Shared business rules for the browser demo; replace persistence with an API later.
export const sum = (items, callback) => items.reduce((total, item) => total + callback(item), 0)
export function availability(data, listing) {
  return Math.max(0, listing.quantity - sum(data.trades.filter(t => t.listingId === listing.id && ['scheduled', 'collecting'].includes(t.status)), t => t.quantity))
}

export function transitionTrade(data, user, id, status) {
  const trade = data.trades.find(t => t.id === id)
  const sellerTransition = trade?.seller === user.id && user.role === 'seller' && (
    (trade.status === 'pending' && ['scheduled', 'declined'].includes(status)) ||
    (trade.status === 'scheduled' && status === 'collecting')
  )
  const buyerTransition = trade?.buyer === user.id && user.role === 'buyer' && trade.status === 'collecting' && status === 'completed'
  if (!sellerTransition && !buyerTransition) throw new Error('Trạng thái đã thay đổi hoặc thao tác không phù hợp vai trò.')
  const listing = data.listings.find(l => l.id === trade.listingId)
  if (status === 'scheduled' && (!listing || listing.status !== 'active' || availability(data, listing) < trade.quantity)) {
    throw new Error('Nguồn vật liệu không còn đủ khối lượng khả dụng để nhận đề nghị này.')
  }
  if (status === 'scheduled' && trade.demandId) {
    const demand = data.demands?.find(item => item.id === trade.demandId && item.owner === trade.buyer)
    const committed = sum(data.trades.filter(item => item.demandId === trade.demandId && ['scheduled', 'collecting', 'completed'].includes(item.status)), item => item.receipt?.decision === 'accepted' ? item.receipt.quantity : item.quantity)
    if (!demand || demand.status !== 'active' || demand.material !== trade.material || committed + trade.quantity > demand.quantity) throw new Error('Nhu cầu thu mua đã tạm dừng hoặc đã đủ khối lượng. Cần bên mua cập nhật trước khi chấp nhận.')
  }
  return {
    ...data,
    // Quantity is current inventory. Completed historical trades are not reserved twice.
    listings: status === 'completed' ? data.listings.map(l => l.id === trade.listingId ? { ...l, quantity: Math.max(0, l.quantity - trade.quantity) } : l) : data.listings,
    trades: data.trades.map(t => t.id === id ? { ...t, status } : t),
  }
}
