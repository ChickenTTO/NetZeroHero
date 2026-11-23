import { useEffect, useRef, useState } from 'react'
import BrandLogo from './BrandLogo'
import { signIn } from '../workspace/mockData'

export default function AuthDialog({ mode, onClose, onModeChange, onSuccess }) {
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
    if (isSignUp) {
      setNotice('Hiện chưa hỗ trợ tạo tài khoản. Vui lòng đăng nhập bằng tài khoản đã được cung cấp.')
      return
    }
    const account = signIn(form.elements.namedItem('identifier').value, form.elements.namedItem('password').value)
    if (account) onSuccess(account)
    else setNotice('Mã đăng nhập hoặc mật khẩu chưa đúng. Vui lòng kiểm tra lại.')
  }

  return <dialog ref={dialog} className="auth-dialog" data-mode={mode} aria-labelledby="auth-title" aria-describedby="auth-description" onCancel={onClose}>
    <div className="auth-panel">
      <button className="auth-close" type="button" aria-label="Đóng cửa sổ tài khoản" onClick={onClose}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="m6 6 12 12M6 18 18 6" /></svg></button>
      <div className="auth-brand"><BrandLogo /><span className="eyebrow">GOM · NETZEROHEROES</span></div>
      <h2 id="auth-title">{isSignUp ? 'Bắt đầu hành trình xanh.' : 'Chào mừng bạn trở lại.'}</h2>
      <p id="auth-description">{isSignUp ? 'Kết nối nguồn vật liệu với đối tác thu mua phù hợp.' : 'Kết nối nguồn vật liệu và tiếp tục hành trình tuần hoàn.'}</p>
      <form onSubmit={submit} onInput={() => setNotice('')}>
        {isSignUp && <div className="auth-field"><label htmlFor="auth-name">Họ và tên / Tên doanh nghiệp</label><input ref={firstField} id="auth-name" name="name" autoComplete="name" required maxLength={100} placeholder="Nhập tên cá nhân hoặc doanh nghiệp" /></div>}
        <div className="auth-field"><label htmlFor="auth-identifier">CCCD / Mã số thuế</label><input ref={isSignUp ? undefined : firstField} id="auth-identifier" name="identifier" type="text" autoComplete="username" autoCapitalize="none" spellCheck={false} required maxLength={32} placeholder="Nhập CCCD hoặc mã số thuế" aria-describedby="auth-identifier-hint" /><small id="auth-identifier-hint">CCCD của cá nhân hoặc mã số thuế của doanh nghiệp.</small></div>
        <div className="auth-field"><label htmlFor="auth-password">Mật khẩu</label><div className="password-control"><input id="auth-password" name="password" type={showPassword ? 'text' : 'password'} autoComplete={isSignUp ? 'new-password' : 'current-password'} required minLength={isSignUp ? 8 : undefined} aria-describedby={isSignUp ? 'password-hint' : undefined} onChange={(event) => { const confirmation = event.currentTarget.form.elements.namedItem('confirmation'); confirmation?.setCustomValidity('') }} /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} aria-pressed={showPassword}>{showPassword ? 'Ẩn' : 'Hiện'}</button></div>{isSignUp && <small id="password-hint">Sử dụng ít nhất 8 ký tự.</small>}</div>
        {isSignUp && <div className="auth-field"><label htmlFor="auth-confirmation">Xác nhận mật khẩu</label><input id="auth-confirmation" name="confirmation" type={showPassword ? 'text' : 'password'} autoComplete="new-password" required onChange={(event) => event.currentTarget.setCustomValidity('')} /></div>}
        <p className="auth-notice" role="status">{notice}</p>
        <button className="button button-primary auth-submit" type="submit">{isSignUp ? 'Đăng ký' : 'Đăng nhập'}</button>
      </form>
      <p className="auth-switch">{isSignUp ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'} <button type="button" onClick={() => onModeChange(isSignUp ? 'login' : 'signup')}>{isSignUp ? 'Đăng nhập' : 'Đăng ký ngay'}</button></p>
    </div>
  </dialog>
}
