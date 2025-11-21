import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'

type Props = {
  title?: string
  children: ReactNode
  full?: boolean
}

export default function Layout({ title, children, full = false }: Props) {
  return (
    <div className="pfw-page">
      <header className="pfw-header">
        <div className={full ? 'pfw-container pfw-container--fluid pfw-header-bar'
                             : 'pfw-container pfw-header-bar'}>
          <div className="pfw-brand">
            <span className="pfw-brand-badge">Campus</span>
            <span>Marketplace</span>
          </div>
          <nav className="pfw-nav">
            <NavLink to="/Listings" className={({isActive})=>isActive?'pfw-active':undefined}>Listings</NavLink>
            <NavLink to="/sell"     className={({isActive})=>isActive?'pfw-active':undefined}>Sell</NavLink>
            <NavLink to="/messages" className={({isActive})=>isActive?'pfw-active':undefined}>Messages</NavLink>
            <NavLink to="/account"  className={({isActive})=>isActive?'pfw-active':undefined}>Account</NavLink>
          </nav>
        </div>
      </header>

      {title && (
        <div className="pfw-titlebar">
          <div className={full ? 'pfw-container pfw-container--fluid'
                               : 'pfw-container'}>
            <h1>{title}</h1>
          </div>
        </div>
      )}

      <main className={`pfw-content pfw-main ${full ? 'pfw-fluid-pad' : ''}`}>
        <div className={full ? 'pfw-container pfw-container--fluid' : 'pfw-container'}>
          {children}
        </div>
      </main>

      <footer className="pfw-footer">
        <div className={full ? 'pfw-container pfw-container--fluid pfw-row'
                             : 'pfw-container pfw-row'}>
          <span>© {new Date().getFullYear()} Campus Marketplace</span>
          <span>•</span>
          <NavLink to="/listings">Listings</NavLink>
          <NavLink to="/sell">Sell</NavLink>
          <NavLink to="/messages">Messages</NavLink>
          <NavLink to="/account">Account</NavLink>
        </div>
      </footer>
    </div>
  )
}
