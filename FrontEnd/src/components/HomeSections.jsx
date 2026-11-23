import { useEffect, useRef, useState } from 'react'
import './HomeSections.css'
import TiltSurface from './TiltSurface'
import EcoOrbit3D from './EcoOrbit3D'

export function Reveal({ children, className = '', delay = 0 }) {
  const element = useRef(null)
  useEffect(() => {
    const node = element.current
    if (!('IntersectionObserver' in window)) return
    node.dataset.reveal = 'pending'
    const show = () => { node.dataset.reveal = 'visible' }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { show(); observer.disconnect() }
    }, { threshold: 0.08 })
    observer.observe(node)
    node.addEventListener('focusin', show)
    return () => { observer.disconnect(); node.removeEventListener('focusin', show) }
  }, [])
  return <div ref={element} className={`reveal ${className}`} style={{ '--reveal-delay': `${delay}ms` }}>{children}</div>
}

export function MarketSection() {
  return <section className="market-section section" aria-labelledby="market-title"><div className="container">
    <Reveal className="section-heading"><div><span className="eyebrow">VÌ SAO CHÚNG TÔI BẮT ĐẦU</span><h2 id="market-title">Tài nguyên chưa hết giá trị.<br />Chỉ đang thiếu một kết nối.</h2></div><p>GOM bắt đầu từ những điểm đứt gãy trong hành trình thu gom và tái chế phế thải của doanh nghiệp.</p></Reveal>
    <div className="market-grid">{[
      ['Giá thu mua thiếu minh bạch', 'Giao dịch phân tán, khó đánh giá chất lượng và tạp chất khiến bên bán lẫn bên mua thiếu cơ sở để thống nhất giá.', 'Dữ liệu vật liệu rõ ràng hơn'],
      ['Vận chuyển chưa tối ưu', 'Nguồn thải nhỏ lẻ, lịch thu gom rời rạc và xe chạy rỗng làm tăng chi phí, nhất là với vật liệu cồng kềnh.', 'Kết nối cùng tuyến, cùng nhu cầu'],
      ['Chứng từ còn rời rạc', 'Thông tin bàn giao, vận chuyển và xử lý thiếu liên kết khiến doanh nghiệp khó theo dõi dòng thải và tổng hợp hồ sơ.', 'Một hành trình dữ liệu xuyên suốt'],
    ].map(([title, description, value], index) => <Reveal key={title} delay={index * 80}><TiltSurface className="market-tilt" maxTilt={5}><article className="market-card"><span className="market-mark" aria-hidden="true">{['≋', '⌁', '▤'][index]}</span><h3>{title}</h3><p>{description}</p><span className="market-outcome">{value}</span></article></TiltSurface></Reveal>)}</div>
    <Reveal><div className="project-principle"><span className="principle-label">Ý TƯỞNG CỐT LÕI</span><p>Biến dòng phế thải của doanh nghiệp này thành <strong>nguồn nguyên liệu cho doanh nghiệp khác.</strong></p><a href="#cong-nghe">Khám phá nền tảng</a></div></Reveal>
  </div></section>
}

const technologies = [
  { name: 'Định giá thông minh', short: 'AI & dữ liệu vật liệu', title: 'Hiểu vật liệu trước khi định giá.', description: 'Hướng đến dùng hình ảnh và dữ liệu đầu vào để hỗ trợ nhận diện vật liệu, ước tính thể tích và đánh giá chất lượng. Mỗi dòng phế thải có cách khai báo riêng để kết quả phù hợp với thực tế.', bullets: ['Xây dựng: video tại điểm tập kết, loại vật liệu và tạp chất.', 'Pin xe điện: mã pin, dữ liệu BMS và sức khỏe pin (SoH).', 'Nông nghiệp: loại phụ phẩm, độ ẩm và vị trí thu gom.'], nodes: ['Hình ảnh / thông số', 'Phân tích vật liệu', 'Cơ sở định giá'], label: 'DỮ LIỆU ĐẦU VÀO', symbol: '◎' },
  { name: 'Logistics ngược', short: 'Ghép chuyến & điều phối', title: 'Nhiều điểm thu gom. Một tuyến hợp lý.', description: 'Mô hình Milk-run hướng đến gom các điểm phát thải gần nhau trên cùng cung đường, kết nối đội xe với nhu cầu tiếp nhận của nhà máy để sử dụng tải trọng hiệu quả hơn.', bullets: ['Ghép điểm thu gom theo vị trí và nhóm vật liệu.', 'Kết nối nguồn thải, đội xe và nơi tiếp nhận.', 'Hạn chế xe chạy rỗng và chuyến vận chuyển rời rạc.'], nodes: ['Điểm thu gom', 'Ghép tuyến vận tải', 'Nhà máy tiếp nhận'], label: 'KẾT NỐI LOGISTICS', symbol: '⌁' },
  { name: 'Chứng từ điện tử', short: 'E-Manifest & kế toán xanh', title: 'Mỗi lần bàn giao, một dấu vết dữ liệu.', description: 'Định hướng liên kết xác nhận giao nhận bằng QR với biên bản bàn giao điện tử, hóa đơn và dữ liệu kế toán. Doanh nghiệp có thể theo dõi hành trình vật liệu thay vì tập hợp hồ sơ rời rạc.', bullets: ['Xác nhận giao nhận tại điểm bàn giao bằng mã QR.', 'Số hóa thông tin nguồn thải, bên vận chuyển và bên nhận.', 'Tổng hợp dữ liệu phục vụ kế toán và báo cáo ESG.'], nodes: ['Xác nhận QR', 'Biên bản điện tử', 'Hồ sơ doanh nghiệp'], label: 'DÒNG DỮ LIỆU CHỨNG TỪ', symbol: '▤' },
  { name: 'Tài chính xanh', short: 'ESG & định hướng carbon', title: 'Từ dữ liệu tái chế đến giá trị dài hạn.', description: 'Dự án hướng đến xây dựng hồ sơ Green Score từ dữ liệu giao dịch và tái chế, hỗ trợ báo cáo ESG và tiếp cận nguồn vốn xanh. Cộng gộp tín chỉ carbon là bước phát triển tiếp theo trong hệ sinh thái.', bullets: ['Theo dõi dòng vật liệu và giá trị thu hồi.', 'Ước tính giảm phát thải theo phương pháp phù hợp.', 'Xác minh lượng giảm phát thải trước khi phát triển tín chỉ.'], nodes: ['Dữ liệu tái chế', 'Đánh giá & xác minh', 'Hồ sơ giá trị xanh'], label: 'ĐỊNH HƯỚNG PHÁT TRIỂN', symbol: '✳' },
]

export function TechnologySection() {
  const [selected, setSelected] = useState(0)
  const technology = technologies[selected]
  return <section className="technology-section section" id="cong-nghe" aria-labelledby="technology-title"><div className="container">
    <Reveal className="section-heading"><div><span className="eyebrow">CÔNG NGHỆ PHỤC VỤ TUẦN HOÀN</span><h2 id="technology-title">Một nền tảng.<br />Kết nối cả hành trình.</h2></div><p>Bốn hướng giải pháp bổ trợ lẫn nhau, từ dữ liệu vật liệu đến vận hành và giá trị xanh của doanh nghiệp.</p></Reveal>
    <Reveal><div className="technology-layout"><div className="technology-options" role="group" aria-label="Khám phá giải pháp công nghệ">{technologies.map((item, index) => <button type="button" key={item.name} aria-pressed={selected === index} aria-controls="technology-content" onClick={() => setSelected(index)}><span className="technology-option-symbol" aria-hidden="true">{item.symbol}</span><span><strong>{item.name}</strong><small>{item.short}</small></span><span className="option-indicator" aria-hidden="true" /></button>)}</div>
      <div className="technology-content" id="technology-content" aria-live="polite" aria-atomic="true"><div className="technology-copy" key={technology.name}><span className="eyebrow">{technology.label}</span><h3>{technology.title}</h3><p>{technology.description}</p><ul>{technology.bullets.map(bullet => <li key={bullet}>{bullet}</li>)}</ul><div className="technology-flow" aria-label="Luồng giải pháp">{technology.nodes.map((node, index) => <div className="flow-node" key={node}><span aria-hidden="true">{index === 2 ? '✓' : technology.symbol}</span><strong>{node}</strong></div>)}</div></div></div>
    </div></Reveal>
  </div></section>
}

const audiences = [
  { name: 'Đơn vị phát thải', type: 'NHÀ THẦU · GARA · HỢP TÁC XÃ', title: 'Thêm giá trị cho phần vật liệu còn lại.', description: 'Dành cho nhà thầu xây dựng, cơ sở dịch vụ xe điện, hợp tác xã và cơ sở chế biến nông sản cần tìm đầu ra phù hợp cho phế thải.', benefits: ['Tiếp cận đơn vị thu mua và xử lý phù hợp với vật liệu.', 'Theo dõi thông tin thu gom, bàn giao và chứng từ.', 'Định hướng thu hồi giá trị bằng tiền hoặc đổi vật liệu tái chế.'], icon: '▦' },
  { name: 'Đối tác vận tải', type: 'ĐỘI XE · HỢP TÁC XÃ VẬN TẢI', title: 'Kết nối chuyến xe với nguồn hàng phù hợp.', description: 'Dành cho đội xe tải, xe ben và đơn vị vận chuyển có năng lực phù hợp với từng nhóm chất thải, cùng tham gia chuỗi thu gom.', benefits: ['Tìm nguồn hàng theo địa bàn và khả năng vận chuyển.', 'Hướng đến gom điểm, ghép tuyến và tối ưu tải trọng.', 'Số hóa xác nhận giao nhận, kết nối thông tin giữa các bên.'], icon: '⌁' },
  { name: 'Đơn vị tái chế', type: 'NHÀ MÁY · CƠ SỞ TÁI SỬ DỤNG', title: 'Chủ động hơn với nguồn nguyên liệu đầu vào.', description: 'Dành cho nhà máy vật liệu tái chế, đơn vị tái chế pin, cơ sở sản xuất viên nén sinh khối và phân bón hữu cơ.', benefits: ['Tìm nguồn vật liệu được mô tả theo đặc tính và chất lượng.', 'Kết nối trực tiếp nhu cầu đầu vào với điểm phát thải.', 'Tăng khả năng truy xuất nguồn vật liệu trong chuỗi cung ứng.'], icon: '♧' },
]

export function EcosystemSection() {
  const [selected, setSelected] = useState(0)
  const audience = audiences[selected]
  return <section className="ecosystem-section section" id="he-sinh-thai" aria-labelledby="ecosystem-title"><div className="container">
    <Reveal className="ecosystem-heading"><span className="eyebrow">MỖI MẮT XÍCH, MỘT GIÁ TRỊ</span><h2 id="ecosystem-title">Cùng tham gia.<br />Cùng tạo lợi ích.</h2><p>GOM hướng đến một mạng lưới cộng tác, nơi nhu cầu của bên này trở thành cơ hội cho bên khác.</p></Reveal>
    <Reveal><div className="audience-options" role="group" aria-label="Lợi ích theo đối tượng">{audiences.map((item, index) => <button type="button" key={item.name} aria-pressed={selected === index} aria-controls="audience-content" onClick={() => setSelected(index)}>{item.name}</button>)}</div><div className="audience-panel" id="audience-content"><EcoOrbit3D selected={selected} onSelect={setSelected} /><div id="audience-description" className="audience-copy" key={audience.name} aria-live="polite" aria-atomic="true"><span className="eyebrow">{audience.type}</span><h3>{audience.title}</h3><p>{audience.description}</p><ul>{audience.benefits.map(benefit => <li key={benefit}>{benefit}</li>)}</ul><a className="ecosystem-link" href="#lo-trinh">Tìm hiểu lộ trình của dự án</a></div></div></Reveal>
  </div></section>
}

export function RoadmapSection() {
  return <section className="roadmap-section section" id="lo-trinh" aria-labelledby="roadmap-title"><div className="container">
    <Reveal className="section-heading"><div><span className="eyebrow">LỘ TRÌNH PHÁT TRIỂN DỰ KIẾN</span><h2 id="roadmap-title">Bắt đầu tập trung.<br />Mở rộng có nền tảng.</h2></div><p>Kế hoạch 18 tháng của dự án: ưu tiên phế thải xây dựng tại Hà Nội, sau đó phát triển các phân hệ và khu vực tiếp theo.</p></Reveal>
    <div className="roadmap-grid">{[
      { period: 'THÁNG 1 – 6', title: 'Đặt nền móng tại Hà Nội', text: 'Tập trung phế thải xây dựng; kết nối nhà thầu, đội xe ben và nhà máy tái chế vật liệu để hình thành chuỗi thu gom ban đầu.', items: ['Nguồn thải xây dựng', 'Mạng lưới đối tác địa phương', 'Quy trình giao nhận & chứng từ'] },
      { period: 'THÁNG 7 – 12', title: 'Mở rộng sang pin xe điện', text: 'Phát triển phân hệ pin và ắc quy tại Hà Nội, Bắc Ninh; bổ sung dữ liệu sức khỏe pin và định hướng hồ sơ tín dụng xanh.', items: ['Đánh giá sức khỏe pin (SoH)', 'Phân luồng tái sử dụng / tái chế', 'Báo cáo ESG & Green Score'] },
      { period: 'THÁNG 13 – 18', title: 'Kết nối sinh khối nông nghiệp', text: 'Mở rộng đến phụ phẩm nông nghiệp tại các tỉnh phía Bắc, kết nối nhu cầu sinh khối và từng bước phát triển cơ chế cộng gộp carbon.', items: ['Nguồn phụ phẩm theo mùa vụ', 'Nhà máy sinh khối & phân hữu cơ', 'Định hướng cộng gộp tín chỉ carbon'] },
    ].map((phase, index) => <Reveal key={phase.period} delay={index * 90}><article className="roadmap-card"><span className="roadmap-point" aria-hidden="true" /><span className="eyebrow">{phase.period}</span><h3>{phase.title}</h3><p>{phase.text}</p><ul>{phase.items.map(item => <li key={item}>{item}</li>)}</ul></article></Reveal>)}</div>
    <Reveal><div className="team-note"><span className="team-emblem" aria-hidden="true">✳</span><div><span className="eyebrow">NHÓM NETZEROHEROES</span><h3>Kết nối công nghệ với tư duy kinh tế xanh.</h3><p>Dự án được phát triển từ Trường Kinh tế, Đại học Công nghiệp Hà Nội, kết hợp các hướng chuyên môn tài chính – kế toán, ESG, vận hành và công nghệ số.</p></div></div></Reveal>
  </div></section>
}
