import { useEffect, useRef, useState } from 'react'

export default function AuthDialog({ mode, onClose, onModeChange }) {
  const dialog = useRef(null)
  const firstField = useRef(null)
  const [showPassword, setShowPassword] = useState(false)
  const [notice, setNotice] = useState('')
  const isSignUp = mode === 'signup'

  useEffect(() => {
    const element = dialog.current
    const previousFocus = document.activeElement
    const previousOverflow = document.body.style.overflow
    element.showModal()
    document.body.style.overflow = 'hidden'
    firstField.current?.focus()
    return () => {
      element.close()
      document.body.style.overflow = previousOverflow
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus()
    }
  }, [])

  function submit(event) {
    event.preventDefault()
    const form = event.currentTarget
    const confirmation = form.elements.namedItem('confirmation')
    if (confirmation && confirmation.value !== form.elements.namedItem('password').value) {
      confirmation.setCustomValidity('Mật khẩu xác nhận chưa khớp.')
      confirmation.reportValidity()
      return
    }
    setNotice('Dịch vụ tài khoản chưa được kết nối. Hiện chưa thể ' + (isSignUp ? 'tạo tài khoản' : 'đăng nhập') + '. Thông tin của bạn chưa được gửi hoặc lưu.')
  }

  return <dialog ref={dialog} className="auth-dialog" aria-labelledby="auth-title" aria-describedby="auth-description" onCancel={onClose}>
    <div className="auth-panel">
      <button className="auth-close" type="button" aria-label="Đóng cửa sổ tài khoản" onClick={onClose}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="m6 6 12 12M6 18 18 6" /></svg></button>
      <span className="eyebrow">CÙNG NETZEROHEROS</span>
      <h2 id="auth-title">{isSignUp ? 'Bắt đầu hành trình xanh.' : 'Chào mừng bạn trở lại.'}</h2>
      <p id="auth-description">{isSignUp ? 'Tạo tài khoản để cùng xây dựng những thói quen tốt hơn.' : 'Đăng nhập để tiếp tục hành trình của bạn.'}</p>
      <form onSubmit={submit} onInput={() => setNotice('')}>
        {isSignUp && <div className="auth-field"><label htmlFor="auth-name">Họ và tên</label><input ref={firstField} id="auth-name" name="name" autoComplete="name" required maxLength={100} placeholder="Nhập họ và tên của bạn" /></div>}
        <div className="auth-field"><label htmlFor="auth-email">Email</label><input ref={isSignUp ? undefined : firstField} id="auth-email" name="email" type="email" autoComplete="email" required placeholder="ban@example.com" /></div>
        <div className="auth-field"><label htmlFor="auth-password">Mật khẩu</label><div className="password-control"><input id="auth-password" name="password" type={showPassword ? 'text' : 'password'} autoComplete={isSignUp ? 'new-password' : 'current-password'} required minLength={isSignUp ? 8 : undefined} aria-describedby={isSignUp ? 'password-hint' : undefined} onChange={(event) => { const confirmation = event.currentTarget.form.elements.namedItem('confirmation'); confirmation?.setCustomValidity('') }} /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} aria-pressed={showPassword}>{showPassword ? 'Ẩn' : 'Hiện'}</button></div>{isSignUp && <small id="password-hint">Sử dụng ít nhất 8 ký tự.</small>}</div>
        {isSignUp && <div className="auth-field"><label htmlFor="auth-confirmation">Xác nhận mật khẩu</label><input id="auth-confirmation" name="confirmation" type={showPassword ? 'text' : 'password'} autoComplete="new-password" required onChange={(event) => event.currentTarget.setCustomValidity('')} /></div>}
        <p className="auth-notice" role="status">{notice}</p>
        <button className="button button-primary auth-submit" type="submit">{isSignUp ? 'Đăng ký' : 'Đăng nhập'}</button>
      </form>
      <p className="auth-switch">{isSignUp ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'} <button type="button" onClick={() => onModeChange(isSignUp ? 'login' : 'signup')}>{isSignUp ? 'Đăng nhập' : 'Đăng ký ngay'}</button></p>
    </div>
  </dialog>
}
