import "../../style/theme.css"
import Layout from '../../layout/Layout'
import { getUser, signOut } from '../../lib/auth'
import { useNavigate } from 'react-router-dom'

export default function Account() {
  const user = getUser()
  const navigate = useNavigate()

  function handleSignOut() {
    signOut()
    navigate('/login', { replace: true })
  }

  return (
    <Layout title="Account">
      <div className="pfw-card" style={{ maxWidth: 640 }}>
        <div className="pfw-card__body">
          {user ? (
            <>
              <p style={{ margin: 0 }}><strong>Name:</strong> {user.name}</p>
              <p style={{ marginTop: 6 }}><strong>Email:</strong> {user.email}</p>
              <div style={{ marginTop: 12 }}>
                <button className="pfw-btn pfw-btn--gold" onClick={handleSignOut}>Sign out</button>
              </div>
            </>
          ) : (
            <>
              <p className="pfw-muted">You are not signed in.</p>
              <a className="pfw-btn pfw-btn--primary" href="/login" style={{ marginTop: 12 }}>Go to Login</a>
            </>
          )}
        </div>
      </div>
    </Layout>
  )
}
