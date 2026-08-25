import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { complianceApi } from '../api/compliance'
import type { AuditLog, AuditSearchCriteria } from '../types/compliance'

export default function AuditLogsPage() {
  const [criteria, setCriteria] = useState<AuditSearchCriteria>({
    page: 0,
    size: 10,
  })
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [totalElements, setTotalElements] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [purgeBefore, setPurgeBefore] = useState('2026-08-02T00:00:00.000Z')

  async function load(next: AuditSearchCriteria = criteria) {
    setLoading(true)
    setError(null)
    try {
      const page = await complianceApi.listAuditLogs(next)
      setLogs(page.content)
      setTotalPages(page.totalPages)
      setTotalElements(page.totalElements)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load audit logs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [criteria.page, criteria.size])

  function applyFilters(e: FormEvent) {
    e.preventDefault()
    const next = { ...criteria, page: 0 }
    setCriteria(next)
    void load(next)
  }

  async function onPurge() {
    if (
      !window.confirm(
        `Purge audit entries older than ${purgeBefore}? This cannot be undone.`,
      )
    ) {
      return
    }
    try {
      const removed = await complianceApi.purgeAuditLogs(purgeBefore)
      alert(`Removed ${removed} entries`)
      await load({ ...criteria, page: 0 })
      setCriteria((c) => ({ ...c, page: 0 }))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Purge failed')
    }
  }

  async function onExport(format: 'csv' | 'json') {
    try {
      const blob = await complianceApi.exportAuditLogs(criteria, format)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `audit-logs.${format}`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Export failed')
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Audit logs</h2>
          <p>Immutable trail of admin, auth, and voting actions.</p>
        </div>
        <div className="toolbar">
          <button type="button" className="btn" onClick={() => void onExport('json')}>
            Export JSON
          </button>
          <button type="button" className="btn" onClick={() => void onExport('csv')}>
            Export CSV
          </button>
        </div>
      </div>

      <form className="filters" onSubmit={applyFilters}>
        <input
          placeholder="Actor"
          value={criteria.actor ?? ''}
          onChange={(e) => setCriteria({ ...criteria, actor: e.target.value })}
        />
        <input
          placeholder="Action"
          value={criteria.action ?? ''}
          onChange={(e) => setCriteria({ ...criteria, action: e.target.value })}
        />
        <input
          placeholder="Entity type"
          value={criteria.entityType ?? ''}
          onChange={(e) =>
            setCriteria({ ...criteria, entityType: e.target.value })
          }
        />
        <button className="btn btn-primary" type="submit">
          Filter
        </button>
      </form>

      <div className="panel toolbar" style={{ justifyContent: 'space-between' }}>
        <div className="toolbar">
          <input
            style={{ minWidth: '220px' }}
            value={purgeBefore}
            onChange={(e) => setPurgeBefore(e.target.value)}
            aria-label="Purge before timestamp"
          />
          <button type="button" className="btn btn-danger" onClick={() => void onPurge()}>
            Purge older
          </button>
        </div>
        <span className="muted">{totalElements} entries</span>
      </div>

      {error && <p className="error">{error}</p>}
      {loading ? (
        <p className="muted">Loading…</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Actor</th>
                <th>Action</th>
                <th>Entity</th>
                <th>IP</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td style={{ fontSize: '0.85rem' }}>
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td>{log.actor}</td>
                  <td>
                    <code>{log.action}</code>
                  </td>
                  <td>
                    <Link
                      to={`/admin/audit-logs/entity/${log.entityType}/${log.entityId}`}
                    >
                      {log.entityType}#{log.entityId}
                    </Link>
                  </td>
                  <td>
                    <code>{log.ipAddress}</code>
                  </td>
                  <td>
                    <Link className="btn" to={`/admin/audit-logs/${log.id}`}>
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="toolbar" style={{ marginTop: '1rem' }}>
        <button
          type="button"
          className="btn"
          disabled={(criteria.page ?? 0) <= 0}
          onClick={() =>
            setCriteria((c) => ({ ...c, page: Math.max(0, (c.page ?? 0) - 1) }))
          }
        >
          Previous
        </button>
        <span className="muted">
          Page {(criteria.page ?? 0) + 1} / {totalPages}
        </span>
        <button
          type="button"
          className="btn"
          disabled={(criteria.page ?? 0) + 1 >= totalPages}
          onClick={() =>
            setCriteria((c) => ({ ...c, page: (c.page ?? 0) + 1 }))
          }
        >
          Next
        </button>
      </div>
    </div>
  )
}
