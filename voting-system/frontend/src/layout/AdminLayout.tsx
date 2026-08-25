import { NavLink, Outlet } from 'react-router-dom'
import { USE_MOCK } from '../api/compliance'

export default function AdminLayout() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">Voting System</div>
          <h1>Compliance</h1>
          <span className="badge">
            ADMIN {USE_MOCK ? '· MOCK' : '· LIVE'}
          </span>
        </div>

        <nav className="nav" aria-label="Admin">
          <div className="nav-section">Rules</div>
          <NavLink to="/admin/compliance/rules" end={false}>
            Compliance rules
          </NavLink>

          <div className="nav-section">Monitoring</div>
          <NavLink to="/admin/compliance" end>
            Activity
          </NavLink>
          <NavLink to="/admin/compliance/anomalies">Anomalies</NavLink>
          <NavLink to="/admin/compliance/verify">Verify integrity</NavLink>
          <NavLink to="/admin/compliance/reports">Reports</NavLink>

          <div className="nav-section">Audit</div>
          <NavLink to="/admin/audit-logs" end>
            Audit logs
          </NavLink>
        </nav>
      </aside>

      <main className="main">
        <Outlet />
      </main>
    </div>
  )
}
