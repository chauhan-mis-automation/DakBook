import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import Postmark from '../components/Postmark'
import { IconEye } from '../components/Icons'

export default function Login() {
  const { user, login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (user) return <Navigate to="/" replace />

  async function submit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await login(username, password)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="login-page">
      <section className="login-side" aria-hidden="true">
        <div className="login-stamp">
          <Postmark size={220} light />
        </div>
        <div className="login-lines" />
        <p className="login-quote">
          Har parcel ka hisaab,<br />ek jagah.
        </p>
      </section>

      <section className="login-main">
        <form className="login-card" onSubmit={submit}>
          <div className="login-brand">
            <Postmark size={52} />
            <div>
              <h1>DakBook</h1>
              <p>COD parcel labels aur records</p>
            </div>
          </div>

          <label className="field">
            <span className="field-label">Username</span>
            <input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" autoCapitalize="none" required autoFocus />
          </label>

          <label className="field">
            <span className="field-label">Password</span>
            <div className="pw-wrap">
              <input type={show ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
              <button type="button" className="pw-toggle" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'} aria-pressed={show}>
                <IconEye />
              </button>
            </div>
          </label>

          {error && <p className="form-error" role="alert">{error}</p>}

          <button className="btn btn-primary btn-block" disabled={busy}>
            {busy ? 'Logging in…' : 'Log in'}
          </button>
        </form>
      </section>
    </div>
  )
}
