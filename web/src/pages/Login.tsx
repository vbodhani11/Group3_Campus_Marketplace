import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import Layout from '../layout/Layout'
import { signIn } from '../lib/auth'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation() as any
  const from = location.state?.from ?? '/account'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await signIn(email.trim(), password)
      navigate(from, { replace: true })
    } catch (err: any) {
      setError(err?.message ?? 'Unable to sign in. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout title="Login" full>
    {/* <div className="pfw-card" style={{ maxWidth: 440, margin: '0 auto' }}> */}
    <div className="pfw-auth">{/* ✅ add this wrapper */}
   {/* <div className="pfw-card" style={{ maxWidth: 500, width: '100%', margin: '0 auto' }}> */}
    <div className="pfw-card" style={{ maxWidth: 640 }}> 
        <div className="pfw-card__body">
          <form onSubmit={onSubmit} noValidate>
            <div className="pfw-field">
              <label className="pfw-label" htmlFor="email">Email</label>
              <input
                id="email"
                className="pfw-input"
                type="email"
                placeholder="you@pfw.edu"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
              <div className="pfw-help">Use your campus or personal email.</div>
            </div>

            <div className="pfw-field">
              <label className="pfw-label" htmlFor="password">Password</label>
              <div style={{ position:'relative' }}>
                <input
                  id="password"
                  className="pfw-input"
                  type={show ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShow(s => !s)}
                  className="pfw-btn pfw-btn--outline"
                  style={{ position:'absolute', right:6, top:6, padding:'6px 10px' }}
                  aria-label={show ? 'Hide password' : 'Show password'}
                >
                  {show ? 'Hide' : 'Show'}
                </button>
              </div>
              <div className="pfw-help">At least 6 characters.</div>
            </div>

            {error && <div className="pfw-error" role="alert">{error}</div>}

            <div className="pfw-form-actions">
              <button className="pfw-btn pfw-btn--primary" type="submit" disabled={loading}>
                {loading ? 'Signing in…' : 'Continue'}
              </button>
              <Link className="pfw-btn pfw-btn--outline" to="/listings">Back to Listings</Link>
            </div>

            <div style={{ marginTop: 12, fontSize: 13 }}>
                <a href="/forgot-password">Forgot password?</a>
            </div>

          </form>
        </div>
      </div>
      </div>
    </Layout>
  )
}
