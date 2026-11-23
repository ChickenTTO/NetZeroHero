import { useEffect, useRef, useState } from 'react'
import BrandLogo from '../components/BrandLogo'
import Icon from './WorkspaceIcon'
import { ListingForm, OfferForm, TradeDetail, Modal } from './WorkspaceDialog'
import { MATERIALS, STATUS, readStore, writeStore, rolePath, money, number, dateLabel, makeId } from './mockData'
import './Workspace.css'
import { sum, availability, transitionTrade } from './transactions'
import { BuyerOperations, SellerOperations, BuyerDemands, DemandForm, CompareSources, BuyerIntake, ReceiptForm, SellerOffers, SellerRecovery, ReadinessChecklist } from './RoleFeatures'
import { saveDemand, toggleDemand, demandProgress, evaluateSupply, updateReadiness, handOver, recordReceipt, requestExchange, cancelExchange, settledQuantity, tradeValue } from './roleActions'

const navigation = [
  ['overview', 'Tổng quan', 'grid'], ['demands', 'Nhu cầu nguyên liệu', 'box', 'buyer'], ['market', 'Tìm nguồn cung', 'search', 'buyer'], ['intake', 'Tiếp nhận & nghiệm thu', 'shield', 'buyer'], ['listings', 'Nguồn vật liệu', 'box', 'seller'],
  ['offers', 'Đề nghị thu mua', 'trade'], ['trades', 'Giao dịch', 'recycle'], ['logistics', 'Lịch thu gom', 'truck'],
  ['documents', 'Chứng từ điện tử', 'file'], ['recovery', 'Giá trị & đổi vật liệu', 'wallet', 'seller'], ['impact', 'Báo cáo tuần hoàn', 'chart'], ['settings', 'Hồ sơ tài khoản', 'settings'],
]
const viewNames = Object.fromEntries(navigation.map(([id, label]) => [id, label]))
const ownTrades = (data, user) => data.trades.filter(trade => trade[user.role] === user.id)
const avatarInitials = name => {
  const parts = name.trim().split(/\s+/)
  return `${parts[0]?.[0] || ''}${parts.length > 1 ? parts.at(-1)[0] : ''}`.toLocaleUpperCase('vi')
}

function Badge({ status }) { return <span className={`ws-badge ${STATUS[status].tone}`}>{STATUS[status].label}</span> }
function Empty({ title = 'Chưa có dữ liệu phù hợp', description = 'Thử thay đổi bộ lọc để xem thêm kết quả.', onReset }) { return <div className="ws-empty"><Icon name="search" size={34} /><h3>{title}</h3><p>{description}</p>{onReset && <button className="ws-button ws-secondary" onClick={onReset}>Xóa bộ lọc</button>}</div> }
function PanelHeading({ title, subtitle, action, onClick }) { return <div className="ws-panel-heading"><div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>{action && <button className="ws-text-button" onClick={onClick}>{action}<Icon name="chevron" size={16} /></button>}</div> }

function ResourceArt() {
  return <div className="ws-resource-art" aria-hidden="true"><span className="ws-orbit orbit-one" /><span className="ws-orbit orbit-two" /><div className="ws-art-center"><Icon name="recycle" size={64} /></div><span className="ws-orbit-icon orbit-leaf"><Icon name="leaf" size={28} /></span><span className="ws-orbit-icon orbit-box"><Icon name="box" size={27} /></span><span className="ws-orbit-icon orbit-truck"><Icon name="truck" size={27} /></span><span className="ws-art-caption">MỘT KẾT NỐI. NHIỀU VÒNG ĐỜI.</span></div>
}

function TradeTable({ trades, role, onDetail, compact = false }) {
  if (!trades.length) return <Empty title="Chưa có giao dịch" description="Các giao dịch phù hợp sẽ xuất hiện tại đây." />
  return <div className="ws-table-scroll" role="region" aria-label="Danh sách giao dịch, cuộn ngang để xem đầy đủ" tabIndex={0}><table className="ws-table"><thead><tr><th>Giao dịch / Vật liệu</th><th>{role === 'buyer' ? 'Bên bán' : 'Bên thu mua'}</th><th>Khối lượng</th>{!compact && <th>Giá trị dự kiến</th>}<th>Trạng thái</th><th><span className="sr-only">Chi tiết</span></th></tr></thead><tbody>{trades.map(trade => <tr key={trade.id}><td><button className="ws-table-link" onClick={() => onDetail(trade)}>{trade.title}</button><span className="ws-cell-meta">{trade.id} · {dateLabel(trade.date)}</span></td><td><span className="ws-partner-name">{role === 'buyer' ? trade.sellerName : trade.buyerName}</span></td><td className="ws-numeric">{number(trade.status === 'completed' ? settledQuantity(trade) : trade.quantity)} {trade.unit}</td>{!compact && <td className="ws-numeric">{money(tradeValue(trade))}</td>}<td><Badge status={trade.status} /></td><td><button className="ws-icon-button" aria-label={`Xem giao dịch ${trade.id}`} onClick={() => onDetail(trade)}><Icon name="chevron" size={18} /></button></td></tr>)}</tbody></table></div>
}

function VolumeChart({ trades }) {
  const completed = trades.filter(t => t.status === 'completed')
  const weeks = [0, 1, 2, 3].map(index => sum(completed.filter(t => Math.min(3, Math.floor((Number(t.date.slice(-2)) - 1) / 7)) === index), settledQuantity))
  const max = Math.max(...weeks, 1)
  return <div className="ws-volume-chart"><div className="ws-chart-top"><strong>{number(sum(completed, settledQuantity))}<small>tấn</small></strong><span className="ws-chart-legend"><i />Đã hoàn tất</span></div><div className="ws-bars" role="img" aria-label={weeks.map((v, i) => `Tuần ${i + 1}: ${number(v)} tấn`).join('; ')}>{weeks.map((v, i) => <div className="ws-bar-column" key={i}><span>{number(v)}</span><div className="ws-bar-track"><div style={{ height: `${Math.max(v / max * 100, 2)}%` }} /></div><span>Tuần {i + 1}</span></div>)}</div></div>
}

function Overview({ user, data, trades, navigate, onCreate, onDetail, onCreateDemand, onSource, onInspect }) {
  const buyer = user.role === 'buyer'
  const done = trades.filter(t => t.status === 'completed')
  const pending = trades.filter(t => t.status === 'pending')
  const active = trades.filter(t => ['scheduled', 'collecting'].includes(t.status))
  const listings = data.listings.filter(l => l.owner === user.id && l.status === 'active')
  const total = sum(done, settledQuantity)
  const demands = data.demands.filter(demand => demand.owner === user.id && demand.status === 'active')
  const stats = buyer ? [
    { icon: 'box', title: 'Nhu cầu đang tìm nguồn', value: number(demands.length), caption: 'Kế hoạch nguyên liệu của doanh nghiệp', color: 'green', action: 'demands' },
    { icon: 'search', title: 'Khối lượng còn cần mua', value: number(sum(demands, demand => Math.max(0, demand.quantity - demandProgress(data, demand).confirmed))), unit: 'tấn', caption: 'Theo các nhu cầu đang mở', color: 'stone', action: 'demands' },
    { icon: 'shield', title: 'Lô hàng chờ nghiệm thu', value: number(trades.filter(trade => trade.status === 'collecting').length), caption: 'Ghi nhận thực nhận & chất lượng', color: 'amber', action: 'intake' },
    { icon: 'wallet', title: 'Giá trị đã tiếp nhận', value: number(sum(done, tradeValue) / 1000000), unit: 'triệu đ', caption: `${number(sum(done, settledQuantity))} tấn đã hoàn tất`, color: 'blue', action: 'impact' },
  ] : [
    { icon: 'recycle', title: buyer ? 'Vật liệu đã tiếp nhận' : 'Vật liệu đã bàn giao', value: number(total), unit: 'tấn', caption: `${done.length} giao dịch đã hoàn tất`, color: 'green' },
    { icon: 'wallet', title: buyer ? 'Giá trị thu mua' : 'Giá trị thu hồi', value: number(sum(done, tradeValue) / 1000000), unit: 'triệu đ', caption: 'Giá trị hàng theo thỏa thuận mẫu', color: 'stone' },
    { icon: 'trade', title: buyer ? 'Đề nghị chờ phản hồi' : 'Đề nghị cần phản hồi', value: number(pending.length), caption: buyer ? 'Đang chờ bên bán xác nhận' : 'Kết nối đang chờ bạn', color: 'amber', action: 'offers' },
    { icon: buyer ? 'truck' : 'box', title: buyer ? 'Lịch thu gom đang mở' : 'Nguồn vật liệu đang mở', value: number(buyer ? active.length : listings.length), caption: buyer ? 'Đã lên lịch hoặc đang vận chuyển' : 'Sẵn sàng kết nối đối tác', color: 'blue', action: buyer ? 'logistics' : 'listings' },
  ]
  return <>
    <section className="ws-welcome"><div><span className="ws-kicker">{buyer ? 'KẾT NỐI NGUỒN CUNG BỀN VỮNG' : 'MỖI NGUỒN VẬT LIỆU, MỘT CƠ HỘI MỚI'}</span><h1>Xin chào, {user.shortName}<span className="ws-greeting-dot">.</span></h1><p>{buyer ? 'Nguồn nguyên liệu phù hợp. Hành trình tuần hoàn rõ ràng.' : 'Biến phụ phẩm hôm nay thành giá trị cho ngày mai.'}</p></div><button className="ws-button ws-secondary" onClick={() => navigate('impact')}><Icon name="calendar" size={18} />Tháng 11, 2026</button></section>
    <section className="ws-hero"><div className="ws-hero-copy"><span className="ws-hero-tag"><Icon name="leaf" size={16} />CÙNG GOM MỞ VÒNG ĐỜI MỚI</span><h2>{buyer ? <>Chủ động nguồn vào.<br /><em>Kiểm soát chất lượng.</em></> : <>Vật liệu còn giá trị.<br /><em>Kết nối để tái sinh.</em></>}</h2><p>{buyer ? 'Lập nhu cầu nguyên liệu, đối chiếu nguồn cung và kiểm soát từng lô hàng vào nhà máy.' : 'Đăng nguồn vật liệu, nhận đề nghị thu mua và chủ động theo dõi hành trình bàn giao.'}</p><button className="ws-button ws-primary" onClick={buyer ? onCreateDemand : onCreate}><Icon name={buyer ? 'search' : 'plus'} size={19} />{buyer ? 'Tạo nhu cầu thu mua' : 'Đăng nguồn vật liệu'}</button></div><ResourceArt /></section>
    <section className="ws-stats" aria-label="Chỉ số tổng quan">{stats.map(stat => <article className="ws-stat" key={stat.title}><div className="ws-stat-label"><span>{stat.title}</span><span className={`ws-stat-icon ${stat.color}`}><Icon name={stat.icon} size={20} /></span></div><p className="ws-stat-value">{stat.value}<small>{stat.unit}</small></p>{stat.action ? <button className="ws-stat-caption ws-text-button" onClick={() => navigate(stat.action)}>{stat.caption}<Icon name="chevron" size={14} /></button> : <span className="ws-stat-caption">{stat.caption}</span>}</article>)}</section>
    {buyer ? <BuyerOperations user={user} data={data} onSource={onSource} onCreate={onCreateDemand} onInspect={onInspect} /> : <SellerOperations user={user} data={data} onDetail={onDetail} navigate={navigate} />}
    <section className="ws-panel"><PanelHeading title="Giao dịch gần đây" subtitle="Các kết nối mới nhất của bạn" action="Tất cả giao dịch" onClick={() => navigate('trades')} /><TradeTable trades={trades.slice(0, 4)} role={user.role} onDetail={onDetail} compact /></section>
    <div className="ws-bottom-note"><Icon name="leaf" size={17} /><span>Mỗi kết nối hôm nay, thêm một vòng đời cho tài nguyên.</span><span>GOM · NetZeroHeroes</span></div>
  </>
}

function ListingCard({ listing, user, data, onOffer, onEdit, onToggle, onSave, saved, compared, onCompare, compareDisabled }) {
  const material = MATERIALS[listing.material]
  const buyer = user.role === 'buyer'
  const available = availability(data, listing)
  return <article className="ws-listing-card"><div className={`ws-material-art ${material.color}`}><span className="ws-material-label">{material.short}</span><Icon name={material.icon} size={68} /><span className="ws-material-ring" />{buyer && <button className={`ws-save-button ${saved ? 'is-saved' : ''}`} aria-label={saved ? `Bỏ lưu ${listing.title}` : `Lưu ${listing.title}`} aria-pressed={saved} onClick={() => onSave(listing.id)}><Icon name="bookmark" size={19} /></button>}{!buyer && <span className={`ws-badge ${listing.status === 'active' ? 'green' : 'gray'}`}>{listing.status === 'active' ? 'Đang mở' : 'Tạm ẩn'}</span>}</div><div className="ws-listing-body"><span className="ws-listing-id">{listing.id} · {listing.seller}</span><h3>{listing.title}</h3><p className="ws-location"><Icon name="pin" size={16} />{listing.location}</p><div className="ws-listing-numbers"><div><span>Khả dụng</span><strong>{number(available)} <small>tấn</small></strong></div><div><span>Giá mong muốn</span><strong>{money(listing.price)}<small>/tấn</small></strong></div></div><div className="ws-material-specs">{listing.material === 'agriculture' ? <><span>Độ ẩm {listing.moisture}%</span><span>Tạp chất {listing.impurity}%</span></> : listing.material === 'battery' ? <><span>{listing.code}</span><span>SoH {listing.soh}% · khai báo</span></> : <><span>Đã phân loại sơ bộ</span><span>Tạp chất {listing.impurity}%</span></>}</div><p className="ws-listing-description">{listing.description}</p>{buyer && <label className="role-compare-check"><input type="checkbox" checked={compared} disabled={compareDisabled} onChange={() => onCompare(listing.id)} aria-label={`So sánh ${listing.title}`} />Thêm vào so sánh</label>}<div className="ws-listing-footer"><span><Icon name="calendar" size={15} />{dateLabel(listing.date)}</span>{buyer ? <button className="ws-button ws-dark" disabled={available <= 0} onClick={() => onOffer(listing)}>{available > 0 ? 'Đề nghị thu mua' : 'Đã giữ chỗ'}</button> : <div className="ws-card-controls"><button className="ws-icon-button" onClick={() => onToggle(listing)} aria-label={`${listing.status === 'active' ? 'Tạm ẩn' : 'Mở lại'} ${listing.title}`}><Icon name={listing.status === 'active' ? 'pause' : 'play'} size={18} /></button><button className="ws-button ws-secondary" onClick={() => onEdit(listing)}><Icon name="edit" size={17} />Sửa tin</button></div>}</div></div></article>
}

function Listings({ user, data, onOffer, onEdit, onCreate, onToggle, onSave, demandId, onDemandChange, onCompare }) {
  const [query, setQuery] = useState(''), [material, setMaterial] = useState('all'), [filter, setFilter] = useState('all'), [sort, setSort] = useState('newest')
  const buyer = user.role === 'buyer'
  const [compared, setCompared] = useState([])
  const demands = data.demands.filter(item => item.owner === user.id && item.status === 'active')
  const demand = demands.find(item => item.id === demandId)
  const comparedListings = data.listings.filter(item => compared.includes(item.id))
  const toggleCompare = id => setCompared(items => items.includes(id) ? items.filter(item => item !== id) : items.length < 3 ? [...items, id] : items)
  const reset = () => { setQuery(''); setMaterial('all'); setFilter('all'); setSort('newest'); if (buyer) onDemandChange('') }
  const listings = data.listings.filter(l => (buyer ? l.status === 'active' : l.owner === user.id) && (!buyer || !demand || evaluateSupply(data, l, demand).matches) && (material === 'all' || l.material === material) && (filter === 'all' || (buyer ? data.saved.includes(l.id) : l.status === filter)) && `${l.title} ${l.location} ${l.seller}`.toLocaleLowerCase('vi').includes(query.toLocaleLowerCase('vi'))).sort((a, b) => sort === 'price' ? a.price - b.price : sort === 'quantity' ? availability(data, b) - availability(data, a) : (b.createdAt || 0) - (a.createdAt || 0) || b.id.localeCompare(a.id))
  return <><PageHeading title={buyer ? 'Tìm nguồn cung phù hợp.' : 'Nguồn vật liệu của bạn.'} description={buyer ? 'Kết nối trực tiếp với nguồn vật liệu. Mở thêm cơ hội tuần hoàn.' : 'Quản lý tin đăng và đưa vật liệu đến đúng đối tác thu mua.'}>{!buyer && <button className="ws-button ws-primary" onClick={onCreate}><Icon name="plus" size={18} />Đăng nguồn vật liệu</button>}</PageHeading>{buyer && <div className="role-market-context"><div><strong>Đối chiếu theo nhu cầu của doanh nghiệp</strong><p>{demand ? `Chỉ hiện nguồn đáp ứng khai báo · ${number(Math.max(0, demand.quantity - demandProgress(data, demand).confirmed))} tấn còn thiếu` : 'Chọn nhu cầu để lọc theo chất lượng, giá, địa điểm và thời hạn.'}</p></div><select aria-label="Nhu cầu dùng để tìm nguồn" value={demand?.id || ''} onChange={event => { onDemandChange(event.target.value); setMaterial('all') }}><option value="">Tất cả nguồn cung</option>{demands.map(item => <option key={item.id} value={item.id} disabled={demandProgress(data, item).confirmed >= item.quantity}>{item.title}</option>)}</select></div>}<div className="ws-category-tabs" aria-label="Nhóm vật liệu">{[['all', 'Tất cả vật liệu', 'grid'], ...Object.entries(MATERIALS).map(([key, item]) => [key, item.label, item.icon])].map(([key, label, icon]) => <button key={key} aria-pressed={material === key} className={material === key ? 'active' : ''} onClick={() => setMaterial(key)}><Icon name={icon} size={19} />{label}</button>)}</div><div className="ws-filter-bar"><label className="ws-search"><Icon name="search" size={19} /><input aria-label="Tìm theo vật liệu, địa điểm hoặc đối tác" placeholder="Tìm vật liệu, địa điểm, đối tác…" value={query} onChange={e => setQuery(e.target.value)} /></label><select aria-label="Lọc tin đăng" value={filter} onChange={e => setFilter(e.target.value)}>{buyer ? <><option value="all">Tất cả nguồn cung</option><option value="saved">Nguồn cung đã lưu</option></> : <><option value="all">Tất cả trạng thái</option><option value="active">Đang mở</option><option value="paused">Tạm ẩn</option></>}</select><select aria-label="Sắp xếp nguồn cung" value={sort} onChange={e => setSort(e.target.value)}><option value="newest">Mới nhất</option><option value="price">Giá tăng dần</option><option value="quantity">Khối lượng giảm dần</option></select></div>{buyer && <div className="role-compare-bar"><span>{comparedListings.length}/3 nguồn đã chọn để so sánh</span><button className="ws-button ws-secondary" disabled={comparedListings.length < 2} onClick={() => onCompare(comparedListings)}>So sánh nguồn đã chọn</button>{compared.length > 0 && <button className="ws-text-button" onClick={() => setCompared([])}>Bỏ chọn</button>}</div>}<p className="ws-results-count">{listings.length} nguồn vật liệu · Thông tin do bên bán khai báo</p>{listings.length ? <div className="ws-listings-grid">{listings.map(l => <ListingCard key={l.id} listing={l} user={user} data={data} onOffer={onOffer} onEdit={onEdit} onToggle={onToggle} onSave={onSave} saved={data.saved.includes(l.id)} compared={compared.includes(l.id)} onCompare={toggleCompare} compareDisabled={compared.length >= 3 && !compared.includes(l.id)} />)}</div> : <div className="ws-panel"><Empty onReset={reset} /></div>}</>
}

function PageHeading({ title, description, children }) { return <div className="ws-page-heading"><div><span className="ws-kicker">KHÔNG GIAN LÀM VIỆC CỦA BẠN</span><h1>{title}</h1><p>{description}</p></div>{children}</div> }

function Transactions({ trades, role, offers, onDetail, onExport, exporting }) {
  const [status, setStatus] = useState('all'), [query, setQuery] = useState('')
  const source = offers ? trades.filter(t => ['pending', 'declined'].includes(t.status)) : trades
  const filtered = source.filter(t => (status === 'all' || t.status === status) && `${t.title} ${t.id} ${t.buyerName} ${t.sellerName}`.toLocaleLowerCase('vi').includes(query.toLocaleLowerCase('vi')))
  return <><PageHeading title={offers ? 'Kết nối bắt đầu từ một đề nghị.' : 'Từng giao dịch, trọn hành trình.'} description={offers ? role === 'buyer' ? 'Theo dõi đề nghị đã gửi và phản hồi từ bên bán.' : 'Xem giá, khối lượng và phản hồi các đối tác thu mua.' : 'Theo dõi từ thỏa thuận đến bàn giao và đối soát.'}><button className="ws-button ws-secondary" onClick={() => onExport(filtered)} disabled={!filtered.length || exporting}><Icon name="download" size={18} />{exporting ? 'Đang tạo PDF…' : 'Xuất danh sách PDF'}</button></PageHeading><div className="ws-filter-bar"><label className="ws-search"><Icon name="search" size={19} /><input aria-label="Tìm giao dịch" placeholder="Tìm mã giao dịch, vật liệu, đối tác…" value={query} onChange={e => setQuery(e.target.value)} /></label><select aria-label="Lọc trạng thái giao dịch" value={status} onChange={e => setStatus(e.target.value)}><option value="all">Tất cả trạng thái</option>{Object.entries(STATUS).filter(([key]) => !offers || ['pending', 'declined'].includes(key)).map(([key, item]) => <option key={key} value={key}>{item.label}</option>)}</select></div><section className="ws-panel"><PanelHeading title={offers ? 'Đề nghị thu mua' : 'Danh sách giao dịch'} subtitle={`${filtered.length} kết quả · Dữ liệu mẫu`} />{filtered.length ? <TradeTable trades={filtered} role={role} onDetail={onDetail} /> : <Empty onReset={() => { setStatus('all'); setQuery('') }} />}</section></>
}

function Logistics({ trades, onDetail, user, onReadiness }) {
  const [filter, setFilter] = useState('upcoming')
  const items = trades.filter(t => filter === 'upcoming' ? ['scheduled', 'collecting'].includes(t.status) : t.status === 'completed').sort((a, b) => a.date.localeCompare(b.date))
  return <><PageHeading title="Chủ động mỗi chuyến thu gom." description="Lịch tập kết, giao nhận và tiến độ vận chuyển trong cùng một nơi." /><div className="ws-category-tabs"><button className={filter === 'upcoming' ? 'active' : ''} onClick={() => setFilter('upcoming')} aria-pressed={filter === 'upcoming'}><Icon name="calendar" size={18} />Đang thực hiện</button><button className={filter === 'completed' ? 'active' : ''} onClick={() => setFilter('completed')} aria-pressed={filter === 'completed'}><Icon name="check" size={18} />Đã hoàn tất</button></div><div className="ws-logistics-grid">{items.map(t => <article className="ws-panel ws-pickup-card" key={t.id}><div className="ws-pickup-date"><Icon name="calendar" /><strong>{dateLabel(t.date)}</strong><Badge status={t.status} /></div><h2>{t.title}</h2><p className="ws-location"><Icon name="pin" size={17} />{t.location}</p><div className="ws-route"><div><span className="ws-route-point" /><p><small>Điểm tập kết</small><strong>{t.sellerName}</strong></p></div><div><span className="ws-route-point destination" /><p><small>Điểm tiếp nhận</small><strong>{t.buyerName}</strong></p></div></div>{user.role === 'seller' && t.status === 'scheduled' && <ReadinessChecklist trade={t} onChange={onReadiness} />}{t.receipt?.decision === 'hold' && <p className="role-quality-banner">Bên thu mua đang kiểm tra: {t.receipt.note}</p>}<div className="ws-pickup-footer"><span>{number(t.quantity)} tấn · {t.id}</span><button className="ws-button ws-secondary" onClick={() => onDetail(t)}>Xem hành trình</button></div></article>)}</div>{!items.length && <section className="ws-panel"><Empty title="Chưa có lịch thu gom" description="Lịch xuất hiện khi đề nghị thu mua được bên bán chấp nhận." /></section>}<p className="ws-callout"><Icon name="info" />Lịch trình là dữ liệu mẫu. Ghép tuyến, theo dõi GPS và đặt xe thực tế chưa được kết nối.</p></>
}

function Documents({ trades, onDocument, onDetail, exporting }) {
  const [query, setQuery] = useState('')
  const items = trades.filter(t => t.status === 'completed' && `${t.id} ${t.title}`.toLocaleLowerCase('vi').includes(query.toLocaleLowerCase('vi')))
  return <><PageHeading title="Dữ liệu rõ ràng. Đối soát dễ dàng." description="Tập hợp biên bản bàn giao mẫu của các giao dịch đã hoàn tất." /><div className="ws-callout"><Icon name="shield" />Bản minh họa để xem trước luồng chứng từ. Chưa phát hành E-Manifest hợp lệ, hóa đơn điện tử hoặc chứng nhận EPR.</div><label className="ws-search ws-document-search"><Icon name="search" size={19} /><input aria-label="Tìm chứng từ" placeholder="Tìm theo mã giao dịch hoặc vật liệu…" value={query} onChange={e => setQuery(e.target.value)} /></label><section className="ws-panel"><PanelHeading title="Trung tâm chứng từ" subtitle={`${items.length} biên bản mẫu sẵn sàng tải`} />{items.length ? <div className="ws-document-list">{items.map(t => <div className="ws-document-row" key={t.id}><span className="ws-document-icon"><Icon name="file" size={25} /></span><div><button className="ws-table-link" onClick={() => onDetail(t)}>Biên bản bàn giao · {t.id}</button><p>{t.title} · {dateLabel(t.date)} · PDF</p></div><span className="ws-badge gray">Bản mẫu</span><button className="ws-button ws-secondary" disabled={exporting} onClick={() => onDocument(t)} aria-label={`Tải biên bản mẫu ${t.id}`}><Icon name="download" size={18} /><span>{exporting ? 'Đang tạo PDF…' : 'Tải PDF'}</span></button></div>)}</div> : <Empty title="Chưa có chứng từ phù hợp" description="Biên bản mẫu xuất hiện sau khi giao dịch hoàn tất." />}</section></>
}

function Impact({ trades, onExport, exporting }) {
  const [period, setPeriod] = useState('2026-11')
  const filtered = trades.filter(t => t.date.startsWith(period)), done = filtered.filter(t => t.status === 'completed')
  const total = sum(done, settledQuantity)
  return <><PageHeading title="Nhìn lại giá trị đã kết nối." description="Theo dõi dòng vật liệu và giá trị giao dịch theo kỳ báo cáo."><select aria-label="Kỳ báo cáo" value={period} onChange={e => setPeriod(e.target.value)}><option value="2026-11">Tháng 11/2026</option><option value="2026-10">Tháng 10/2026</option></select><button className="ws-button ws-secondary" disabled={!filtered.length || exporting} onClick={() => onExport(filtered, { report: true, period })}><Icon name="download" size={18} />{exporting ? 'Đang tạo PDF…' : 'Xuất báo cáo PDF'}</button></PageHeading><div className="ws-report-summary"><div><span>Khối lượng hoàn tất</span><strong>{number(total)} <small>tấn</small></strong></div><div><span>Giá trị hàng thỏa thuận</span><strong>{money(sum(done, tradeValue))}</strong></div><div><span>Giao dịch hoàn tất</span><strong>{done.length}</strong></div></div><div className="ws-overview-grid"><section className="ws-panel"><PanelHeading title="Khối lượng theo tuần" subtitle={`Đơn vị: tấn · ${period === '2026-11' ? 'Tháng 11' : 'Tháng 10'}/2026`} /><VolumeChart trades={filtered} /></section><section className="ws-panel"><PanelHeading title="Cơ cấu vật liệu" subtitle="Tỷ trọng khối lượng đã hoàn tất" /><div className="ws-material-progress">{Object.entries(MATERIALS).map(([key, mat]) => { const value = sum(done.filter(t => t.material === key), settledQuantity); return <div key={key}><div><span><Icon name={mat.icon} size={17} />{mat.label}</span><strong>{number(value)} tấn</strong></div><progress value={value} max={total || 1} aria-label={`${mat.label}: ${number(value)} trên ${number(total)} tấn`} /><small>{total ? number(value / total * 100) : 0}% tổng khối lượng</small></div> })}</div></section></div><section className="ws-panel ws-impact-note"><span className="ws-impact-icon"><Icon name="leaf" size={38} /></span><div><h2>Dữ liệu tốt là điểm khởi đầu.</h2><p>Khối lượng bàn giao chưa đồng nghĩa với lượng vật liệu đã tái chế. GOM cần bằng chứng xử lý và phương pháp tính được xác minh trước khi đưa ra kết quả CO₂e, Green Score hoặc tín chỉ carbon.</p><span className="ws-badge amber">CO₂e: chưa đủ dữ liệu tính toán</span></div></section></>
}

function Settings({ user, onSave }) {
  const [error, setError] = useState('')
  return <><PageHeading title="Thông tin kết nối của bạn." description="Cập nhật hồ sơ hiển thị trong không gian làm việc mẫu." /><section className="ws-panel ws-settings-panel"><PanelHeading title="Hồ sơ tổ chức / cá nhân" subtitle="Không cần cung cấp thông tin thật trong bản dùng thử" /><form className="ws-form" onSubmit={e => { e.preventDefault(); const data = Object.fromEntries(new FormData(e.currentTarget)); if (Object.values(data).some(v => !v.trim())) { setError('Vui lòng nhập nội dung hợp lệ, không chỉ khoảng trắng.'); return } setError(''); onSave(Object.fromEntries(Object.entries(data).map(([k, v]) => [k, v.trim()]))) }}><div className="ws-field"><label htmlFor="profile-kind">Loại tài khoản</label><select id="profile-kind" name="kind" defaultValue={user.kind}>{(user.role === 'buyer' ? ['Doanh nghiệp thu mua'] : ['Doanh nghiệp', 'Hợp tác xã', 'Nông dân', 'Người dân']).map(kind => <option key={kind}>{kind}</option>)}</select></div><div className="ws-field"><label htmlFor="profile-name">Tên hiển thị</label><input id="profile-name" name="name" defaultValue={user.name} maxLength={100} required /></div><div className="ws-form-grid"><div className="ws-field"><label htmlFor="profile-short">Tên gọi ngắn</label><input id="profile-short" name="shortName" defaultValue={user.shortName} maxLength={24} required /></div><div className="ws-field"><label htmlFor="profile-contact">Người liên hệ</label><input id="profile-contact" name="contact" defaultValue={user.contact} maxLength={80} required /></div></div><div className="ws-form-grid"><div className="ws-field"><label htmlFor="profile-location">Tỉnh / thành phố</label><input id="profile-location" name="location" defaultValue={user.location} maxLength={80} required /></div><div className="ws-field"><label htmlFor="profile-email">Email liên hệ</label><input id="profile-email" name="email" type="email" defaultValue={user.email} maxLength={120} required /></div></div>{error && <p className="ws-error" role="alert">{error}</p>}<p className="ws-callout"><Icon name="info" size={18} />Thay đổi hồ sơ không làm thay đổi mã đăng nhập hoặc mật khẩu dùng thử.</p><button className="ws-button ws-primary" type="submit">Lưu hồ sơ</button></form></section></>
}

export default function Workspace({ account, view, onLogout }) {
  const [data, setData] = useState(readStore)
  const [demandId, setDemandId] = useState('')
  const [exporting, setExporting] = useState(false)
  const exportLock = useRef(false)
  const [modal, setModal] = useState(null), [toast, setToast] = useState(''), [menuOpen, setMenuOpen] = useState(false)
  const [compactNavigation, setCompactNavigation] = useState(() => window.matchMedia('(max-width: 1000px)').matches)
  const user = data.profiles[account.id], trades = ownTrades(data, user)
  const buyer = user.role === 'buyer'
  const allowed = navigation.filter(([, , , role]) => !role || role === user.role)
  const selected = allowed.some(([id]) => id === view) ? view : 'overview'
  const pendingCount = trades.filter(t => t.status === 'pending').length
  useEffect(() => { const update = e => { if (e.key === 'gom.workspace.v1') setData(readStore()) }; window.addEventListener('storage', update); return () => window.removeEventListener('storage', update) }, [])
  useEffect(() => { const query = window.matchMedia('(max-width: 1000px)'); const resize = e => setCompactNavigation(e.matches); query.addEventListener('change', resize); return () => query.removeEventListener('change', resize) }, [])
  useEffect(() => { if (!toast) return; const timer = setTimeout(() => setToast(''), 5000); return () => clearTimeout(timer) }, [toast])
  useEffect(() => { document.title = `${viewNames[selected]} · ${buyer ? 'Thu mua' : 'Bên bán'} · GOM`; window.scrollTo(0, 0) }, [selected, buyer])
  useEffect(() => { if (!menuOpen) return; const close = e => { if (e.key === 'Escape') { setMenuOpen(false); document.getElementById('ws-mobile-toggle')?.focus() } }; document.addEventListener('keydown', close); return () => document.removeEventListener('keydown', close) }, [menuOpen])
  function commit(next, message) { const saved = writeStore(next); setData(next); setToast(saved ? message : `${message} Bộ nhớ trình duyệt bị chặn; thay đổi chỉ giữ trong lần mở này.`) }
  function navigate(next) { setMenuOpen(false); window.location.hash = `/${rolePath(user.role)}/${next}` }
  function sourceForDemand(id) { setDemandId(id); navigate('market') }
  function applyAction(action, message) {
    try { commit(action(), message); return '' } catch (error) { setToast(error.message); return error.message }
  }
  function saveDemandForm(values) {
    const error = applyAction(() => saveDemand(data, user, values, modal.demand?.id), 'Đã lưu nhu cầu và tiêu chuẩn nguyên liệu.')
    if (!error) setModal(null)
    return error
  }
  function saveReceipt(values) {
    const error = applyAction(() => recordReceipt(data, user, modal.trade.id, values), values.decision === 'accepted' ? 'Đã nghiệm thu. Báo cáo và PDF cập nhật theo khối lượng thực nhận.' : 'Đã tạm giữ lô hàng để kiểm tra. Bên bán có thể xem ghi chú.')
    if (!error) setModal(null)
    return error
  }
  const onInspect = trade => setModal({ type: 'receipt', trade })
  const onReadiness = (id, key, checked) => applyAction(() => updateReadiness(data, user, id, key, checked), 'Đã cập nhật chuẩn bị bàn giao.')
  function saveListing(values) {
    const editing = modal.listing
    if (editing) { const reserved = sum(data.trades.filter(t => t.listingId === editing.id && ['scheduled', 'collecting'].includes(t.status)), settledQuantity); if (values.quantity < reserved) { setToast(`Cần giữ ít nhất ${number(reserved)} tấn cho các lịch đã xác nhận.`); return } }
    const item = { ...editing, ...values, id: editing?.id || makeId('VL'), createdAt: editing ? editing.createdAt || 0 : Date.now(), owner: user.id, seller: user.name, status: editing?.status || 'active' }
    commit({ ...data, listings: editing ? data.listings.map(l => l.id === item.id ? item : l) : [item, ...data.listings] }, editing ? 'Đã cập nhật nguồn vật liệu.' : 'Đã đăng nguồn vật liệu. Tài khoản thu mua có thể xem và gửi đề nghị.')
    setModal(null)
  }
  function saveOffer(values) {
    const listing = data.listings.find(l => l.id === modal.listing.id)
    if (!listing || listing.status !== 'active' || values.quantity > availability(data, listing) || values.quantity <= 0 || values.date < listing.date) { setToast('Nguồn vật liệu đã thay đổi. Vui lòng kiểm tra lại khối lượng và lịch.'); setModal(null); return }
    const demand = modal.demandId ? data.demands.find(item => item.id === modal.demandId && item.owner === user.id) : null
    if (modal.demandId && (!demand || demand.status !== 'active' || !evaluateSupply(data, listing, demand).matches || values.price > demand.maxPrice || values.date > demand.deadline || values.quantity > demand.quantity - demandProgress(data, demand).confirmed)) {
      setToast('Đề nghị chưa đáp ứng tiêu chuẩn hoặc phần còn thiếu của nhu cầu. Vui lòng kiểm tra lại.')
      return
    }
    if (modal.demandId && (!demand || demand.status !== 'active' || !evaluateSupply(data, listing, demand).matches || values.quantity > demand.quantity - demandProgress(data, demand).confirmed || values.price > demand.maxPrice || values.date > demand.deadline)) { setToast('Đề nghị vượt nhu cầu, tiêu chuẩn hoặc hạn cần hàng. Vui lòng kiểm tra lại.'); return }
    const trade = { ...values, ...(demand ? { demandId: demand.id } : {}), id: makeId('GOM'), listingId: listing.id, buyer: user.id, buyerName: user.name, seller: listing.owner, sellerName: listing.seller, title: listing.title, material: listing.material, unit: listing.unit, location: listing.location, status: 'pending' }
    commit({ ...data, trades: [trade, ...data.trades] }, 'Đã gửi đề nghị mẫu. Bên bán có thể đăng nhập để phản hồi.')
    setModal(null); navigate('offers')
  }
  function changeStatus(trade, status) {
    try {
      if (user.role === 'buyer' && status === 'completed') { onInspect(trade); return }
      commit(status === 'collecting' ? handOver(data, user, trade.id) : transitionTrade(data, user, trade.id, status), `Đã cập nhật giao dịch: ${STATUS[status].label.toLocaleLowerCase('vi')}.`)
      setModal(null)
    } catch (error) { setToast(error.message) }
  }
  async function runPdfExport(generate, successMessage) {
    if (exportLock.current) return
    exportLock.current = true
    setExporting(true)
    setToast('Đang tạo file PDF…')
    try {
      const exporter = await import('./pdfExport.js')
      await generate(exporter)
      setToast(successMessage)
    } catch {
      setToast('Không thể tạo PDF. Vui lòng kiểm tra kết nối và thử lại.')
    } finally {
      exportLock.current = false
      setExporting(false)
    }
  }
  function exportTrades(items, options = {}) {
    return runPdfExport(exporter => exporter.downloadTradesPdf(items, { profile: user, ...options }), options.report ? 'Đã tải báo cáo tuần hoàn dạng PDF.' : 'Đã tải danh sách giao dịch dạng PDF.')
  }
  function exportDocument(trade) {
    return runPdfExport(exporter => exporter.downloadHandoverPdf(trade, user), 'Đã tải biên bản bàn giao minh họa dạng PDF.')
  }
  const onDetail = trade => setModal({ type: 'trade', trade })
  function openOffer(listing) {
    const demand = data.demands.find(item => item.id === demandId && item.owner === user.id && item.status === 'active')
    if (demand && demandProgress(data, demand).confirmed >= demand.quantity) { setToast('Nhu cầu này đã đủ khối lượng. Chọn nhu cầu khác để tiếp tục.'); return }
    setModal({ type: 'offer', listing, demandId: demand?.id })
  }
  const offerDemand = modal?.demandId ? data.demands.find(item => item.id === modal.demandId) : null
  return <div className="ws-app"><a className="skip-link" href="#workspace-main">Đến nội dung chính</a>{menuOpen && <button className="ws-menu-backdrop" aria-label="Đóng điều hướng" onClick={() => setMenuOpen(false)} />}<aside id="workspace-navigation" className={`ws-sidebar ${menuOpen ? 'is-open' : ''}`} inert={!menuOpen && compactNavigation ? true : undefined}><a href="#home" className="ws-brand" aria-label="GOM, về trang chủ"><BrandLogo /><span>GOM<small>by NetZeroHeroes</small></span></a><div className="ws-role-switch"><span className="ws-role-symbol"><Icon name={buyer ? 'building' : 'leaf'} size={20} /></span><div><strong>{buyer ? 'Không gian thu mua' : 'Không gian bên bán'}</strong><small>{buyer ? 'Doanh nghiệp & nhà máy' : 'Doanh nghiệp · HTX · Cá nhân'}</small></div></div><span className="ws-nav-label">KHÔNG GIAN LÀM VIỆC</span><nav aria-label="Điều hướng không gian làm việc">{allowed.map(([id, label, icon]) => <a href={`#/${rolePath(user.role)}/${id}`} key={id} className={selected === id ? 'active' : ''} aria-current={selected === id ? 'page' : undefined} onClick={() => setMenuOpen(false)}><Icon name={icon} size={20} /><span>{label}</span>{id === 'offers' && pendingCount > 0 && <span className="ws-nav-count">{pendingCount}</span>}</a>)}</nav><div className="ws-sidebar-bottom"><div className="ws-sidebar-tip"><Icon name="recycle" size={28} /><strong>Thêm một vòng đời.</strong><p>Kết nối đúng đối tác.<br />Giữ lại giá trị tài nguyên.</p><a href="#cach-hoat-dong">Khám phá về GOM<Icon name="chevron" size={14} /></a></div><button className="ws-account-button" onClick={() => navigate('settings')}><span className="ws-avatar">{avatarInitials(user.shortName)}</span><span><strong>{user.shortName}</strong><small>{user.kind}</small></span><Icon name="settings" size={17} /></button><button className="ws-logout" onClick={onLogout}><Icon name="logout" size={18} />Đăng xuất</button></div></aside>
    <div className="ws-main-shell"><header className="ws-topbar"><div className="ws-breadcrumb"><button className="ws-icon-button ws-mobile-toggle" id="ws-mobile-toggle" aria-label={menuOpen ? 'Đóng điều hướng' : 'Mở điều hướng'} aria-controls="workspace-navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}><Icon name={menuOpen ? 'close' : 'menu'} /></button><span>{buyer ? 'Doanh nghiệp thu mua' : 'Bên bán'}</span><Icon name="chevron" size={14} /><strong>{viewNames[selected]}</strong></div><div className="ws-topbar-actions"><span className="ws-demo-label"><Icon name="info" size={14} />Dữ liệu mẫu</span><button className="ws-icon-button ws-notification" aria-label={`Thông báo, ${pendingCount} đề nghị đang chờ`} onClick={() => setModal({ type: 'notifications' })}><Icon name="bell" size={21} />{pendingCount > 0 && <span />}</button><button className="ws-avatar ws-header-avatar" onClick={() => navigate('settings')} aria-label="Xem hồ sơ">{avatarInitials(user.shortName)}</button></div></header>
      <main className="ws-main" id="workspace-main">{selected === 'overview' && <Overview user={user} data={data} trades={trades} navigate={navigate} onCreate={() => setModal({ type: 'listing' })} onDetail={onDetail} onCreateDemand={() => setModal({ type: 'demand' })} onSource={sourceForDemand} onInspect={onInspect} />}{['market', 'listings'].includes(selected) && <Listings user={user} data={data} onOffer={openOffer} demandId={demandId} onDemandChange={setDemandId} onCompare={listings => setModal({ type: 'compare', listings })} onEdit={listing => setModal({ type: 'listing', listing })} onCreate={() => setModal({ type: 'listing' })} onToggle={listing => commit({ ...data, listings: data.listings.map(l => l.id === listing.id ? { ...l, status: l.status === 'active' ? 'paused' : 'active' } : l) }, listing.status === 'active' ? 'Đã tạm ẩn tin. Lịch thu gom đã xác nhận vẫn được giữ.' : 'Đã mở lại nguồn vật liệu.')} onSave={id => commit({ ...data, saved: data.saved.includes(id) ? data.saved.filter(key => key !== id) : [...data.saved, id] }, data.saved.includes(id) ? 'Đã bỏ lưu nguồn cung.' : 'Đã lưu nguồn cung.')} />}{(selected === 'trades' || (selected === 'offers' && buyer)) && <Transactions key={selected} trades={trades} role={user.role} offers={selected === 'offers'} onDetail={onDetail} onExport={exportTrades} exporting={exporting} />}{selected === 'logistics' && <Logistics trades={trades} onDetail={onDetail} user={user} onReadiness={onReadiness} />}{selected === 'documents' && <Documents trades={trades} onDocument={exportDocument} onDetail={onDetail} exporting={exporting} />}{selected === 'impact' && <Impact trades={trades} onExport={exportTrades} exporting={exporting} />}{selected === 'settings' && <Settings user={user} onSave={values => commit({ ...data, profiles: { ...data.profiles, [user.id]: { ...user, ...values } }, listings: data.listings.map(l => l.owner === user.id ? { ...l, seller: values.name } : l) }, 'Đã lưu hồ sơ hiển thị.')} />}{selected === 'demands' && <BuyerDemands user={user} data={data} onCreate={() => setModal({ type: 'demand' })} onEdit={demand => setModal({ type: 'demand', demand })} onToggle={id => applyAction(() => toggleDemand(data, user, id), 'Đã cập nhật trạng thái nhu cầu.')} onSource={sourceForDemand} />}{selected === 'intake' && <BuyerIntake user={user} data={data} onInspect={onInspect} onDetail={onDetail} />}{selected === 'offers' && !buyer && <SellerOffers user={user} data={data} onDetail={onDetail} onExport={exportTrades} exporting={exporting} />}{selected === 'recovery' && <SellerRecovery user={user} data={data} onRequest={(id, quantity) => applyAction(() => requestExchange(data, user, id, quantity), 'Đã tạo phương án đổi vật liệu mẫu.')} onCancel={id => applyAction(() => cancelExchange(data, user, id), 'Đã hủy và giải phóng giá trị giữ chỗ mẫu.')} />}</main>
    </div>
    <div className="ws-toast" role="status" aria-live="polite">{toast && <><Icon name="check" size={19} /><span>{toast}</span><button aria-label="Đóng thông báo" onClick={() => setToast('')}><Icon name="close" size={17} /></button></>}</div>
    {modal?.type === 'listing' && <ListingForm listing={modal.listing} onSave={saveListing} onClose={() => setModal(null)} />}{modal?.type === 'offer' && <OfferForm listing={modal.listing} demand={offerDemand} available={Math.min(availability(data, modal.listing), offerDemand ? Math.max(0, offerDemand.quantity - demandProgress(data, offerDemand).confirmed) : Infinity)} onSave={saveOffer} onClose={() => setModal(null)} />}{modal?.type === 'trade' && <TradeDetail trade={data.trades.find(t => t.id === modal.trade.id)} role={user.role} onClose={() => setModal(null)} onStatus={changeStatus} onDocument={exportDocument} exporting={exporting} onReadiness={onReadiness} />}{modal?.type === 'demand' && <DemandForm demand={modal.demand} onSave={saveDemandForm} onClose={() => setModal(null)} />}{modal?.type === 'receipt' && <ReceiptForm trade={data.trades.find(item => item.id === modal.trade.id)} onSave={saveReceipt} onClose={() => setModal(null)} />}{modal?.type === 'compare' && <CompareSources listings={modal.listings} data={data} onClose={() => setModal(null)} onOffer={openOffer} />}{modal?.type === 'notifications' && <Modal title="Thông báo của bạn" description="Các đề nghị thu mua đang chờ phản hồi trong bản dùng thử." onClose={() => setModal(null)}>{trades.filter(t => t.status === 'pending').map(t => <button key={t.id} className="ws-notification-item" onClick={() => onDetail(t)}><span className="ws-next-icon"><Icon name="trade" /></span><span><strong>{t.title}</strong><small>{buyer ? 'Đang chờ bên bán phản hồi' : `${t.buyerName} đã gửi đề nghị`}</small></span><Icon name="chevron" size={18} /></button>)}{!pendingCount && <Empty title="Bạn đã xem hết thông báo" description="Đề nghị mới sẽ xuất hiện tại đây." />}</Modal>}
  </div>
}
