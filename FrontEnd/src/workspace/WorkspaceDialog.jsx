import { useEffect, useRef, useState } from 'react'
import Icon from './WorkspaceIcon'
import { MATERIALS, STATUS, money, number, dateLabel, today } from './mockData'
import { readyForPickup, READINESS, tradeValue } from './roleActions'

export function Modal({ title, description, onClose, children, wide = false }) {
  const ref = useRef(null)
  useEffect(() => {
    const element = ref.current
    const previous = document.activeElement
    const overflow = document.body.style.overflow
    element.showModal()
    document.body.style.overflow = 'hidden'
    return () => { element.close(); document.body.style.overflow = overflow; if (previous?.isConnected) previous.focus() }
  }, [])
  return <dialog ref={ref} className={`ws-dialog ${wide ? 'ws-dialog-wide' : ''}`} onCancel={onClose} aria-labelledby="ws-dialog-title" aria-describedby={description ? 'ws-dialog-description' : undefined}>
    <div className="ws-dialog-heading"><div><span className="ws-kicker">GOM · KHÔNG GIAN TUẦN HOÀN</span><h2 id="ws-dialog-title">{title}</h2></div><button className="ws-icon-button" onClick={onClose} aria-label="Đóng cửa sổ"><Icon name="close" /></button></div>
    {description && <p id="ws-dialog-description" className="ws-muted ws-dialog-description">{description}</p>}
    {children}
  </dialog>
}

export function ListingForm({ listing, onSave, onClose }) {
  const [material, setMaterial] = useState(listing?.material || 'agriculture')
  const [error, setError] = useState('')
  function submit(event) {
    event.preventDefault()
    const data = Object.fromEntries(new FormData(event.currentTarget))
    const quantity = Number(data.quantity), price = Number(data.price)
    if (!data.title.trim() || !data.location.trim() || !data.description.trim()) { setError('Vui lòng điền đầy đủ nội dung, không chỉ khoảng trắng.'); return }
    if (!Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(price) || price <= 0) { setError('Khối lượng và đơn giá phải lớn hơn 0.'); return }
    if (data.date < today()) { setError('Ngày sẵn sàng thu gom phải từ hôm nay trở đi.'); return }
    onSave({ title: data.title.trim(), material, quantity, unit: 'tấn', price, location: data.location.trim(), date: data.date, description: data.description.trim(), ...(material === 'agriculture' ? { moisture: Number(data.moisture), impurity: Number(data.impurity) } : material === 'battery' ? { code: data.code.trim(), soh: Number(data.soh) } : { impurity: Number(data.impurity) }) })
  }
  return <Modal title={listing ? 'Chỉnh sửa nguồn vật liệu' : 'Đăng nguồn vật liệu mới'} description="Thông tin rõ ràng giúp bạn kết nối đúng đối tác thu mua. Tin đăng này được lưu thử trên trình duyệt." onClose={onClose} wide>
    <form className="ws-form" onSubmit={submit}>
      <div className="ws-field"><label htmlFor="material">Nhóm vật liệu</label><select id="material" value={material} onChange={e => setMaterial(e.target.value)}>{Object.entries(MATERIALS).map(([key, item]) => <option key={key} value={key}>{item.label}</option>)}</select></div>
      <div className="ws-field"><label htmlFor="listing-title">Tên nguồn vật liệu</label><input id="listing-title" name="title" required maxLength={100} defaultValue={listing?.title} placeholder="Ví dụ: Rơm cuộn khô sau thu hoạch" /></div>
      <div className="ws-form-grid"><div className="ws-field"><label htmlFor="quantity">Khối lượng (tấn)</label><input id="quantity" name="quantity" type="number" min="0.01" max="100000" step="0.01" required defaultValue={listing?.quantity} placeholder="12" /></div><div className="ws-field"><label htmlFor="price">Giá mong muốn (đ/tấn)</label><input id="price" name="price" type="number" min="1" max="1000000000" step="1" required defaultValue={listing?.price} placeholder="850000" /></div></div>
      <div className="ws-form-grid"><div className="ws-field"><label htmlFor="location">Địa điểm tập kết</label><input id="location" name="location" required maxLength={160} defaultValue={listing?.location} placeholder="Xã/phường, tỉnh/thành phố" /></div><div className="ws-field"><label htmlFor="available-date">Sẵn sàng thu gom từ</label><input id="available-date" name="date" type="date" min={today()} required defaultValue={listing?.date >= today() ? listing.date : today()} /></div></div>
      {material === 'agriculture' && <div className="ws-form-grid"><div className="ws-field"><label htmlFor="moisture">Độ ẩm khai báo (%)</label><input id="moisture" name="moisture" type="number" min="0" max="100" step="0.1" defaultValue={listing?.moisture ?? 14} required /></div><Impurity value={listing?.impurity} /></div>}
      {material === 'construction' && <Impurity value={listing?.impurity} />}
      {material === 'battery' && <><div className="ws-form-grid"><div className="ws-field"><label htmlFor="battery-code">Mã / loại pin</label><input id="battery-code" name="code" maxLength={80} required defaultValue={listing?.code} placeholder="LFP-48V" /></div><div className="ws-field"><label htmlFor="soh">SoH khai báo (%)</label><input id="soh" name="soh" type="number" min="0" max="100" step="0.1" required defaultValue={listing?.soh} /></div></div><p className="ws-callout"><Icon name="info" />Pin cần đối tác có điều kiện tiếp nhận phù hợp. Dữ liệu SoH khai báo chưa phải kết quả kiểm định.</p></>}
      <div className="ws-field"><label htmlFor="description">Mô tả & điều kiện thu gom</label><textarea id="description" name="description" required rows={3} maxLength={1000} defaultValue={listing?.description} placeholder="Tình trạng vật liệu, đường vào, bốc xếp, khung giờ phù hợp…" /></div>
      {error && <p className="ws-error" role="alert">{error}</p>}
      <div className="ws-dialog-actions"><button type="button" className="ws-button ws-secondary" onClick={onClose}>Hủy</button><button className="ws-button ws-primary" type="submit"><Icon name="check" size={18} />{listing ? 'Lưu thay đổi' : 'Đăng nguồn vật liệu'}</button></div>
    </form>
  </Modal>
}
function Impurity({ value }) { return <div className="ws-field"><label htmlFor="impurity">Tạp chất khai báo (%)</label><input id="impurity" name="impurity" type="number" min="0" max="100" step="0.1" defaultValue={value ?? 3} required /></div> }

export function OfferForm({ listing, available, demand, onSave, onClose }) {
  const [quantity, setQuantity] = useState(Math.min(available, 3))
  const [price, setPrice] = useState(listing.price)
  return <Modal title="Gửi đề nghị thu mua" description={`${listing.title} · ${listing.seller}`} onClose={onClose}>
    {demand && <p className="ws-callout"><Icon name="box" />Theo nhu cầu: {demand.title} · Tối đa {money(demand.maxPrice)}/tấn · Hạn {dateLabel(demand.deadline)}</p>}<div className="ws-offer-summary"><Icon name={MATERIALS[listing.material].icon} size={32} /><div><strong>{number(available)} tấn khả dụng</strong><span>Giá mong muốn: {money(listing.price)}/tấn</span></div></div>
    <form className="ws-form" onSubmit={event => { event.preventDefault(); const form = new FormData(event.currentTarget); onSave({ quantity: Number(form.get('quantity')), price: Number(form.get('price')), date: form.get('date'), note: form.get('note').trim() }) }}>
      <div className="ws-form-grid"><div className="ws-field"><label htmlFor="offer-quantity">Khối lượng mua (tấn)</label><input id="offer-quantity" name="quantity" type="number" step="0.01" min="0.01" max={available} required value={quantity} onChange={e => setQuantity(e.target.value)} /></div><div className="ws-field"><label htmlFor="offer-price">Đơn giá đề nghị (đ/tấn)</label><input id="offer-price" name="price" type="number" min="1" max={demand?.maxPrice || 1000000000} step="1" required value={price} onChange={e => setPrice(e.target.value)} /></div></div>
      <div className="ws-field"><label htmlFor="offer-date">Ngày thu gom dự kiến</label><input id="offer-date" name="date" type="date" max={demand?.deadline} min={listing.date > today() ? listing.date : today()} defaultValue={listing.date > today() ? listing.date : today()} required /></div>
      <div className="ws-field"><label htmlFor="offer-note">Lời nhắn cho bên bán</label><textarea id="offer-note" name="note" maxLength={600} rows={3} placeholder="Yêu cầu chất lượng, khung giờ và điều kiện giao nhận…" /></div>
      <div className="ws-total"><span>Giá trị hàng dự kiến</span><strong>{money((Number(quantity) || 0) * (Number(price) || 0))}</strong></div><p className="ws-muted ws-small">Chưa gồm vận chuyển và thuế. Chỉ là đề nghị mẫu, không phát sinh thanh toán.</p>
      <div className="ws-dialog-actions"><button type="button" className="ws-button ws-secondary" onClick={onClose}>Hủy</button><button type="submit" className="ws-button ws-primary">Gửi đề nghị</button></div>
    </form>
  </Modal>
}

export function TradeDetail({ trade, role, onClose, onStatus, onDocument, exporting, onReadiness }) {
  const state = STATUS[trade.status]
  const next = role === 'seller' && trade.status === 'pending' ? ['scheduled', 'Chấp nhận đề nghị'] : role === 'seller' && trade.status === 'scheduled' ? ['collecting', 'Xác nhận đã bàn giao'] : role === 'buyer' && trade.status === 'collecting' ? ['completed', 'Ghi nhận nghiệm thu'] : null
  return <Modal title={trade.id} description={trade.title} onClose={onClose} wide>
    <div className="ws-detail-top"><span className={`ws-badge ${state.tone}`}>{state.label}</span><strong>{money(tradeValue(trade))}</strong></div>
    {trade.status !== 'declined' && <ol className="ws-timeline">{['Đề nghị', 'Lên lịch', 'Bàn giao', 'Hoàn tất'].map((text, i) => <li key={text} className={i <= state.step ? 'is-done' : ''}><span>{i <= state.step ? <Icon name="check" size={16} /> : <Icon name="clock" size={16} />}</span>{text}</li>)}</ol>}
    <dl className="ws-detail-grid"><div><dt>Bên bán</dt><dd>{trade.sellerName}</dd></div><div><dt>Bên thu mua</dt><dd>{trade.buyerName}</dd></div><div><dt>Khối lượng thỏa thuận</dt><dd>{number(trade.quantity)} {trade.unit}</dd></div><div><dt>Đơn giá thỏa thuận</dt><dd>{money(trade.price)}/{trade.unit}</dd></div><div><dt>Ngày thu gom</dt><dd>{dateLabel(trade.date)}</dd></div><div><dt>Điểm tập kết</dt><dd>{trade.location}</dd></div></dl>
    {role === 'seller' && trade.status === 'scheduled' && <fieldset className="role-readiness"><legend>Chuẩn bị trước khi bàn giao</legend>{READINESS.map(([key, label]) => <label key={key}><input type="checkbox" checked={Boolean(trade.readiness?.[key])} onChange={event => onReadiness(trade.id, key, event.target.checked)} /><span>{label}</span></label>)}</fieldset>}{trade.receipt && <div className="ws-detail-note"><strong>{trade.receipt.decision === 'hold' ? 'Đang giữ để kiểm tra' : 'Kết quả nghiệm thu đầu vào'}</strong><p>Thực nhận: {number(trade.receipt.quantity)} tấn · {trade.receipt.note || 'Không có ghi chú bổ sung.'}</p></div>}<div className="ws-detail-note"><strong>Ghi chú giao dịch</strong><p>{trade.note || 'Chưa có ghi chú bổ sung.'}</p></div>
    <p className="ws-callout"><Icon name="info" />{trade.status === 'completed' ? 'Chứng từ ở đây là bản minh họa, không thay thế biên bản hoặc hóa đơn có giá trị pháp lý.' : 'Bên bán xác nhận lịch và bàn giao; bên thu mua xác nhận nhận hàng. Mọi thao tác chỉ cập nhật dữ liệu mẫu.'}</p>
    <div className="ws-dialog-actions">{role === 'seller' && trade.status === 'pending' && <button className="ws-button ws-secondary ws-danger" onClick={() => onStatus(trade, 'declined')}>Từ chối</button>}{trade.status === 'completed' && <button className="ws-button ws-secondary" disabled={exporting} onClick={() => onDocument(trade)}><Icon name="download" size={18} />{exporting ? 'Đang tạo PDF…' : 'Tải biên bản PDF'}</button>}{next && <button className="ws-button ws-primary" disabled={role === 'seller' && trade.status === 'scheduled' && !readyForPickup(trade)} onClick={() => onStatus(trade, next[0])}>{next[1]}</button>}<button className="ws-button ws-secondary" onClick={onClose}>Đóng</button></div>
  </Modal>
}
