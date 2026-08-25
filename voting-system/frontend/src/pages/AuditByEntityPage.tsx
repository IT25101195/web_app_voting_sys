import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { complianceApi } from '../api/compliance'
import type { AuditLog } from '../types/compliance'

export default function AuditByEntityPage() {
  const { type, entityId } = useParams()
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await complianceApi.getAuditLogsByEntity(
          type ?? '',
          Number(entityId),
        )
        if (!cancelled) setLogs(data)
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [type, entityId])

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>
            Audit for {type}#{entityId}
          </h2>
          <p>All audit entries for this entity.</p>
        </div>
        <Link className="btn" to="/admin/audit-logs">
          Back
        </Link>
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
                <th>Details</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5}>No entries.</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id}>
                    <td>{new Date(log.timestamp).toLocaleString()}</td>
                    <td>{log.actor}</td>
                    <td>
                      <code>{log.action}</code>
                    </td>
                    <td>{log.details}</td>
                    <td>
                      <Link className="btn" to={`/admin/audit-logs/${log.id}`}>
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
