import { useState } from "react"
import Layout from "../../layout/Layout"

export default function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setSent(true)
  }

  return (
    <Layout title="Forgot Password">
      <div className="pfw-auth">
        <div className="pfw-card" style={{ maxWidth: 460, width: "100%" }}>
          <div className="pfw-card__body">
            {!sent ? (
              <form onSubmit={onSubmit}>
                <p className="pfw-muted">
                  Enter your email and we’ll send you a reset link.
                </p>
                <div className="pfw-field">
                  <label className="pfw-label" htmlFor="email">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    className="pfw-input"
                    placeholder="you@pfw.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="pfw-form-actions">
                  <button type="submit" className="pfw-btn pfw-btn--primary">
                    Send reset link
                  </button>
                  <a href="/login" className="pfw-btn pfw-btn--outline">
                    Back to Login
                  </a>
                </div>
              </form>
            ) : (
              <>
                <p>
                  If an account exists for <strong>{email}</strong>, we’ve sent
                  a reset link.
                </p>
                <div style={{ marginTop: 12 }}>
                  <a href="/login" className="pfw-btn pfw-btn--outline">
                    Return to Login
                  </a>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
