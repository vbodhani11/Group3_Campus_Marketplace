import { useState } from "react"
import Layout from "../layout/Layout"
import { Link } from "react-router-dom"

export default function Login() {
  const [mode, setMode] = useState<"login" | "signup">("login")

  // login fields
  const [loginEmail, setLoginEmail] = useState("")
  const [showLoginPass, setShowLoginPass] = useState(false)

  // signup fields
  const [signupName, setSignupName] = useState("")
  const [signupEmail, setSignupEmail] = useState("")
  const [showSignupPass, setShowSignupPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  return (
    <Layout title={mode === "login" ? "Login" : "Create Account"}>
      <div className="pfw-auth">
        <div className="pfw-card" style={{ maxWidth: 520, width: "100%" }}>
          <div className="pfw-card__body">
            {/* Tabs */}
            <div className="auth-tabs">
              <button
                type="button"
                onClick={() => setMode("login")}
                className={`pfw-btn ${mode === "login" ? "pfw-btn--gold" : "pfw-btn--outline"}`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setMode("signup")}
                className={`pfw-btn ${mode === "signup" ? "pfw-btn--gold" : "pfw-btn--outline"}`}
              >
                Sign Up
              </button>
            </div>

            {mode === "login" ? (
              <form noValidate>
                {/* Email */}
                <div className="pfw-field">
                  <label className="pfw-label" htmlFor="login-email">Email</label>
                  <input
                    id="login-email"
                    type="email"
                    className="pfw-input"
                    placeholder="you@pfw.edu"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>

                {/* Password */}
                <div className="pfw-field" style={{ position: "relative" }}>
                  <label className="pfw-label" htmlFor="login-password">Password</label>
                  <input
                    id="login-password"
                    type={showLoginPass ? "text" : "password"}
                    className="pfw-input"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPass(v => !v)}
                    style={{ position: "absolute", right: 12, top: 38, background: "none", border: 0, cursor: "pointer", color: "#666", fontSize: 13 }}
                  >
                    {showLoginPass ? "Hide" : "Show"}
                  </button>
                </div>

                <div className="pfw-form-actions">
                  <button type="submit" className="pfw-btn pfw-btn--primary">Login</button>
                  <Link to="/forgot-password" className="pfw-btn pfw-btn--outline">Forgot password?</Link>
                </div>

                {/* Inline fallback link so Sign Up is ALWAYS reachable */}
                <div className="auth-inline">
                  <span>Don’t have an account?</span>
                  <button type="button" className="pfw-link" onClick={() => setMode("signup")}>
                    Sign up
                  </button>
                </div>
              </form>
            ) : (
              <form noValidate>
                {/* Full Name */}
                <div className="pfw-field">
                  <label className="pfw-label" htmlFor="signup-name">Full Name</label>
                  <input
                    id="signup-name"
                    type="text"
                    className="pfw-input"
                    placeholder="Jane Doe"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    autoComplete="name"
                    required
                  />
                </div>

                {/* Email */}
                <div className="pfw-field">
                  <label className="pfw-label" htmlFor="signup-email">Email</label>
                  <input
                    id="signup-email"
                    type="email"
                    className="pfw-input"
                    placeholder="you@pfw.edu"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>

                {/* Password */}
                <div className="pfw-field" style={{ position: "relative" }}>
                  <label className="pfw-label" htmlFor="signup-password">Password</label>
                  <input
                    id="signup-password"
                    type={showSignupPass ? "text" : "password"}
                    className="pfw-input"
                    placeholder="Create a password"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignupPass(v => !v)}
                    style={{ position: "absolute", right: 12, top: 38, background: "none", border: 0, cursor: "pointer", color: "#666", fontSize: 13 }}
                  >
                    {showSignupPass ? "Hide" : "Show"}
                  </button>
                </div>

                {/* Confirm Password */}
                <div className="pfw-field" style={{ position: "relative" }}>
                  <label className="pfw-label" htmlFor="signup-confirm">Confirm Password</label>
                  <input
                    id="signup-confirm"
                    type={showConfirm ? "text" : "password"}
                    className="pfw-input"
                    placeholder="Re-enter password"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(v => !v)}
                    style={{ position: "absolute", right: 12, top: 38, background: "none", border: 0, cursor: "pointer", color: "#666", fontSize: 13 }}
                  >
                    {showConfirm ? "Hide" : "Show"}
                  </button>
                </div>

                <div className="pfw-form-actions">
                  <button type="submit" className="pfw-btn pfw-btn--primary">Create Account</button>
                  <button type="button" className="pfw-btn pfw-btn--outline" onClick={() => setMode("login")}>
                    Back to Login
                  </button>
                </div>

                {/* Inline fallback link so Login is ALWAYS reachable */}
                <div className="auth-inline">
                  <span>Already have an account?</span>
                  <button type="button" className="pfw-link" onClick={() => setMode("login")}>
                    Log in
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
