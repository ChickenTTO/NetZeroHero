import { useEffect, useRef, useState } from 'react'
import './App.css'
import AuthDialog from './components/AuthDialog'
import Globe3D from './components/Globe3D'
import TiltSurface from './components/TiltSurface'
import { Reveal, MarketSection, TechnologySection, EcosystemSection, RoadmapSection } from './components/HomeSections'

const currentYear = new Date().getFullYear()

function Icon({ name = 'leaf' }) {
  const shapes = {
    leaf: <><path d="M20 4C10 3 3 7 5 14c2 7 14 7 15-10Z" /><path d="M4 21 15 10M9 16v-5M9 16h5" /></>,
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" /></>,
    bike: <><circle cx="5" cy="16" r="4" /><circle cx="19" cy="16" r="4" /><path d="m5 16 5-9 5 9H5m8-12h3l3 12M8 7h5" /></>,
    battery: <><rect x="2" y="6" width="18" height="12" rx="2" /><path d="M22 10v4M12 8l-3 5h5l-3 4" /></>,
    home: <path d="m3 10 9-7 9 7v11H3ZM9 21v-8h6v8" />,
    heart: <path d="M20 5c-3-3-7-1-8 1-1-2-5-4-8-1-4 4 1 9 8 15 7-6 12-11 8-15Z" />,
    check: <path d="m5 12 4 4L19 6" />,
    plus: <path d="M12 5v14M5 12h14" />,
    menu: <path d="M4 6h16M4 12h16M4 18h16" />,
    close: <path d="m6 6 12 12M6 18 18 6" />,
  }
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{shapes[name]}</svg>
}

function Brand() {
  return <a className="brand" href="#home" aria-label="NetZeroHeros — Trang chủ"><Icon />NetZero<span>Heros</span></a>
}

function Planet() {
  return <div className="planet-scene"><span className="sr-only" role="img" aria-label="Mô hình hành tinh xanh 3D với các vòng quỹ đạo tượng trưng cho kết nối tuần hoàn" />
    <Globe3D fallback={<svg className="planet-art" viewBox="0 0 560 560" fill="none" aria-hidden="true">
      <defs>
        <radialGradient id="globe" cx=".35" cy=".25" r=".8"><stop stopColor="#e6f7c4" /><stop offset=".58" stopColor="#a6d77b" /><stop offset="1" stopColor="#548b4c" /></radialGradient>
        <linearGradient id="land" x1="150" y1="140" x2="420" y2="430" gradientUnits="userSpaceOnUse"><stop stopColor="#507940" /><stop offset="1" stopColor="#254b33" /></linearGradient>
        <clipPath id="sphere"><circle cx="280" cy="304" r="171" /></clipPath>
      </defs>
      <circle cx="280" cy="283" r="229" stroke="#8faf79" strokeOpacity=".18" strokeDasharray="3 9" />
      <ellipse cx="280" cy="304" rx="253" ry="89" stroke="#8faf79" strokeOpacity=".2" transform="rotate(-29 280 304)" />
      <circle cx="280" cy="304" r="189" stroke="#8faf79" strokeOpacity=".12" />
      <circle cx="280" cy="304" r="171" fill="url(#globe)" />
      <g clipPath="url(#sphere)">
        <path d="m114 238 47-47 35 4 17-23 34 17 17 31-15 24-35-2-13 27 20 27-18 28-33-8-18-37-39 2ZM290 145l24 35 38 9 21 38 39 7 37 45-19 20-43-11-30 17-22-34-39-4-8-39-31-26 9-32ZM229 329l43-27 38 21 8 36-20 24-4 43-27 32-20-25 8-40-28-27ZM373 375l31-19 33 12 6 29-39 29-22-15Z" fill="url(#land)" />
        <ellipse cx="280" cy="304" rx="100" ry="171" stroke="#f3ffe6" strokeOpacity=".17" /><path d="M109 304h342M131 226c90 34 209 34 298 0M131 382c90-34 209-34 298 0" stroke="#f3ffe6" strokeOpacity=".17" />
      </g>
      <path d="M274 177c-40-17-62-54-47-103 44 9 69 49 47 103Z" fill="#69b84a" /><path d="M276 179c-8-35 5-77 53-93 17 42-5 86-53 93Z" fill="#a5ed75" /><path d="m275 190-25-80m25 80 33-72" stroke="#365e35" strokeWidth="3" />
      <g transform="translate(117 303)"><path d="M-25 8 0-60 25 8Z" fill="#30583b" /><path d="M-32 31 0-35 32 31Z" fill="#3d6b42" /><path d="M0 12v48" stroke="#9cba77" strokeWidth="5" /></g>
      <g transform="translate(422 267)"><path d="M0 0v-74" stroke="#d7e6c4" strokeWidth="5" /><circle cy="-74" r="5" fill="#e9f3db" /><path d="m0-74 5-38-9 4ZM0-74l31 24 1-10ZM0-74l-36 11 8 7Z" fill="#e9f3db" /></g>
      <g transform="translate(350 414) rotate(-12)"><path d="M-30-22h64L23 9h-65Z" fill="#294b40" stroke="#cee7b3" strokeWidth="2" /><path d="m-9-22-12 31M12-22 1 9M-35-7h63" stroke="#89b995" /><path d="M-6 9v18M-21 27H9" stroke="#b1c696" strokeWidth="3" /></g>
      <path d="m118 130 4-12 4 12 12 4-12 4-4 12-4-12-12-4ZM453 380l3-9 3 9 9 3-9 3-3 9-3-9-9-3Z" fill="#a6dc7c" /><circle cx="423" cy="131" r="6" fill="#68ef3f" /><circle cx="79" cy="373" r="4" fill="#a5bf80" />
    </svg>} />
    <div className="floating-note note-top"><span className="note-symbol"><Icon name="sun" /></span><div>Kết nối B2B<strong>Khơi thông nguồn lực</strong></div></div>
    <div className="floating-note note-bottom"><span className="note-symbol"><Icon /></span><div>Giá trị tuần hoàn<strong>Từ phế thải đến tài nguyên</strong></div><span className="note-check"><Icon name="check" /></span></div>
    <span className="scene-caption">KẾT NỐI NGUỒN THẢI. MỞ VÒNG ĐỜI MỚI.</span>
  </div>
}

const actions = [
  { icon: 'home', tag: 'PHẾ THẢI XÂY DỰNG', title: 'Vòng đời mới cho vật liệu công trình.', description: 'Kết nối bê tông vỡ, gạch vụn và vật liệu thải với nhu cầu nguyên liệu của nhà máy tái chế; hướng đến thu hồi giá trị và giảm chi phí xử lý.', suggestion: 'Trọng tâm khởi đầu: Hà Nội', className: 'travel' },
  { icon: 'battery', tag: 'PIN & ẮC QUY XE ĐIỆN', title: 'Phân loại đúng, khai thác giá trị còn lại.', description: 'Định hướng đánh giá sức khỏe pin (SoH) để phân luồng tái sử dụng hoặc tái chế, kết nối với đơn vị xử lý có giấy phép phù hợp.', suggestion: 'Lộ trình mở rộng: giai đoạn 2', className: 'energy' },
  { icon: 'leaf', tag: 'PHỤ PHẨM NÔNG NGHIỆP', title: 'Từ phụ phẩm đến nguồn nguyên liệu.', description: 'Kết nối rơm rạ, trấu và vỏ nông sản với nhà máy viên nén sinh khối, cơ sở sản xuất phân hữu cơ; hướng đến tận dụng nguồn phụ phẩm sau thu hoạch.', suggestion: 'Lộ trình mở rộng: giai đoạn 3', className: 'living' },
]
const questions = [
  ['ReLoop Vietnam dành cho những ai?', 'Dự án của nhóm Net Zero Heroes hướng đến kết nối các nhà thầu xây dựng, cơ sở dịch vụ xe điện, hợp tác xã nông nghiệp với đội xe vận tải và các nhà máy tái chế, tái sử dụng. Nền tảng đóng vai trò trung gian công nghệ, không trực tiếp vận chuyển hay lưu kho chất thải.'],
  ['AI hỗ trợ định giá phế thải như thế nào?', 'Với phế thải xây dựng, hướng tiếp cận là sử dụng video quay tại điểm tập kết để ước tính thể tích và nhận diện tạp chất. Với pin, dữ liệu mã pin và hệ thống quản lý pin (BMS) hỗ trợ đánh giá sức khỏe pin (SoH). Với phụ phẩm nông nghiệp, dữ liệu đầu vào gồm loại phụ phẩm, độ ẩm và vị trí tập kết.'],
  ['Chứng từ điện tử mang lại giá trị gì cho doanh nghiệp?', 'ReLoop hướng đến số hóa biên bản bàn giao chất thải (E-Manifest), kết nối hóa đơn điện tử và sổ kế toán xanh. Dữ liệu giao nhận được xác nhận bằng mã QR là cơ sở để theo dõi dòng vật liệu và hỗ trợ lập báo cáo ESG của doanh nghiệp.'],
  ['Dự án định hướng tín chỉ carbon và tài chính xanh ra sao?', 'Dự án hướng đến tổng hợp dữ liệu tái chế để ước tính lượng giảm phát thải CO₂e, xây dựng hồ sơ Green Score và hỗ trợ tiếp cận tài chính xanh. Cộng gộp tín chỉ carbon là định hướng phát triển; lượng giảm phát thải cần được xác minh theo phương pháp và tiêu chuẩn áp dụng trước khi có thể trở thành tín chỉ.'],
]

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [authMode, setAuthMode] = useState(null)
  const menuButton = useRef(null)
  useEffect(() => {
    const onEscape = (event) => {
      if (event.key === 'Escape' && menuOpen) {
        setMenuOpen(false)
        menuButton.current?.focus()
      }
    }
    document.addEventListener('keydown', onEscape)
    return () => document.removeEventListener('keydown', onEscape)
  }, [menuOpen])
  return <>
    {authMode && <AuthDialog key={authMode} mode={authMode} onClose={() => setAuthMode(null)} onModeChange={setAuthMode} />}
    <a className="skip-link" href="#main">Đến nội dung chính</a>
    <div className="hero-shell" id="home">
      <header className="site-header container"><Brand /><button ref={menuButton} className="menu-toggle" aria-label={menuOpen ? 'Đóng menu' : 'Mở menu'} aria-expanded={menuOpen} aria-controls="navigation" onClick={() => setMenuOpen(!menuOpen)}><Icon name={menuOpen ? 'close' : 'menu'} /></button><nav id="navigation" className={`navigation ${menuOpen ? 'is-open' : ''}`} aria-label="Điều hướng chính" onClick={(event) => { if (event.target.closest('a')) setMenuOpen(false) }}><a href="#home" aria-current="page">Trang chủ</a><a href="#cach-hoat-dong">Cách hoạt động</a><a href="#hanh-dong">Lĩnh vực</a><a href="#cau-hoi">Câu hỏi thường gặp</a><div className="nav-auth"><button type="button" className="button button-login" onClick={() => setAuthMode('login')}>Đăng nhập</button><button type="button" className="button button-primary nav-cta" onClick={() => setAuthMode('signup')}>Đăng ký</button></div></nav></header>
      <main id="main">
        <section className="hero container" aria-labelledby="hero-title"><div className="hero-copy"><span className="eyebrow hero-eyebrow"><span />KINH TẾ TUẦN HOÀN CHO DOANH NGHIỆP</span><h1 id="hero-title">Kết nối phế thải,<br />kiến tạo giá trị<br /><span>tuần hoàn.</span></h1><p>ReLoop Vietnam — dự án của nhóm Net Zero Heroes, hướng đến kết nối nguồn phế thải, vận tải và tái chế trên một nền tảng B2B. Từ định giá đến chứng từ, khơi mở giá trị cho doanh nghiệp.</p><div className="hero-buttons"><a className="button button-primary" href="#hanh-dong">Khám phá giải pháp</a><a className="text-link" href="#cach-hoat-dong"><span className="play-icon" aria-hidden="true"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5a1 1 0 0 1 1.5-.86l10 6.5a1 1 0 0 1 0 1.72l-10 6.5A1 1 0 0 1 8 18.5Z" /></svg></span>Cách hoạt động</a></div><div className="hero-footnote"><Icon name="heart" /><span>Kết nối doanh nghiệp. Tái tạo tài nguyên.</span></div></div><Planet /></section>
        <div className="values-strip"><div className="container"><span><Icon />Định giá minh bạch</span><span><Icon name="sun" />Tối ưu vận chuyển</span><span><Icon name="heart" />Số hóa chứng từ</span></div></div>
        <MarketSection />
        <section className="how-section section" id="cach-hoat-dong" aria-labelledby="how-title"><div className="container"><div className="section-heading"><div><span className="eyebrow">GIẢI PHÁP RELOOP VIETNAM</span><h2 id="how-title">Từ điểm phát thải<br />đến vòng đời tài nguyên mới.</h2></div><p>Kết nối các mắt xích còn phân tán: nguồn thải, vận tải và tái chế, với dữ liệu xuyên suốt quy trình.</p></div><div className="steps-grid">{[['Khai báo & định giá', 'Ghi nhận loại vật liệu, khối lượng và vị trí tập kết. Ứng dụng AI hỗ trợ đánh giá chất lượng, hướng đến định giá minh bạch.'], ['Ghép chuyến & thu gom', 'Kết nối nguồn thải với đội xe và nhà máy phù hợp. Gom nhiều điểm trên cùng tuyến để tối ưu tải trọng, hạn chế xe chạy rỗng.'], ['Xác nhận & ghi nhận giá trị', 'Xác nhận giao nhận bằng QR, số hóa chứng từ E-Manifest và dữ liệu kế toán xanh, làm cơ sở theo dõi tái chế và báo cáo ESG.']].map(([title, text], index) => <article className="step" key={title}><span className="step-number">0{index + 1}</span><h3>{title}</h3><p>{text}</p></article>)}</div></div></section>
        <section className="actions-section section" id="hanh-dong" aria-labelledby="actions-title"><div className="container"><div className="section-heading"><div><span className="eyebrow">BA DÒNG PHẾ THẢI, MỘT HỆ SINH THÁI</span><h2 id="actions-title">Khơi mở giá trị từ phế thải đặc thù.</h2></div><span className="section-aside">Mũi nhọn trước, hệ sinh thái sau.</span></div><div className="actions-grid">{actions.map(action => <Reveal key={action.tag}><TiltSurface className="action-tilt" maxTilt={6}><article className={`action-card ${action.className}`}><div className="action-art"><Icon name={action.icon} /><span className="art-orbit" /><span className="art-spark">✳</span><span className="art-caption">RELOOP VIETNAM · CIRCULAR ECONOMY</span></div><div className="action-content"><span className="eyebrow">{action.tag}</span><h3>{action.title}</h3><p>{action.description}</p><div className="suggestion"><Icon name="check" /><span>{action.suggestion}</span></div></div></article></TiltSurface></Reveal>)}</div><p className="action-disclaimer">Định hướng trao đổi tuần hoàn: phế thải xây dựng đổi vật liệu tái chế, phụ phẩm nông nghiệp đổi phân bón hữu cơ.</p></div></section>
        <TechnologySection />
        <EcosystemSection />
        <RoadmapSection />
        <section className="faq-section section" id="cau-hoi" aria-labelledby="faq-title"><div className="container faq-layout"><div className="faq-intro"><span className="eyebrow">HIỂU THÊM VỀ DỰ ÁN</span><h2 id="faq-title">Công nghệ kết nối.<br />Giá trị cho doanh nghiệp.</h2><p>Tìm hiểu mô hình B2B, định giá AI, chứng từ điện tử và định hướng tài chính xanh của ReLoop Vietnam.</p><div className="faq-leaf"><Icon /></div></div><div className="faq-list">{questions.map(([question, answer]) => <details key={question}><summary>{question}<Icon name="plus" /></summary><p>{answer}</p></details>)}</div></div></section>
        <section className="closing-section"><div className="container closing-content"><span className="eyebrow">CÙNG XÂY DỰNG HỆ SINH THÁI TUẦN HOÀN</span><h2>Phế thải hôm nay.<br />Nguồn lực cho ngày mai.</h2><p>Kết nối đơn vị phát thải, đội xe và nhà máy tái chế để cùng tạo giá trị.</p><a className="button button-primary" href="#hanh-dong">Tìm hiểu các lĩnh vực</a><span className="closing-decoration"><Icon /></span></div></section>
      </main>
    </div>
    <footer className="site-footer"><div className="container footer-top"><div><Brand /><p>Kết nối phế thải. Kiến tạo giá trị tuần hoàn.</p></div><nav aria-label="Liên kết cuối trang"><a href="#cong-nghe">Công nghệ</a><a href="#he-sinh-thai">Hệ sinh thái</a><a href="#lo-trinh">Lộ trình</a><a href="#cau-hoi">Câu hỏi thường gặp</a></nav></div><div className="container footer-bottom"><span>© {currentYear} NetZeroHeros.</span><span>ReLoop Vietnam · Nhóm Net Zero Heroes<Icon /></span></div></footer>
  </>
}
export default App



