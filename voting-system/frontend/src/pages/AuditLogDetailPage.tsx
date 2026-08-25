import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { complianceApi } from '../api/compliance'
import type { AuditLog } from '../types/compliance'

export default function AuditLogDetailPage() {
  const { id } = useParams()
  const [log, setLog] = useState<AuditLog | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setError(null)
      try {
        const data = await complianceApi.getAuditLog(Number(id))
        if (!cancelled) setLog(data)
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Not found')
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [id])

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Audit entry #{id}</h2>
          <p>Single audit log record.</p>
        </div>
        <Link className="btn" to="/admin/audit-logs">
          Back
        </Link>
      </div>

      {error && <p className="error">{error}</p>}
      {log && (
        <div className="panel">
          <dl style={{ display: 'grid', gap: '0.75rem', margin: 0 }}>
            <div>
              <dt className="muted">Actor</dt>
              <dd style={{ margin: 0 }}>{log.actor}</dd>
            </div>
            <div>
              <dt className="muted">Action</dt>
              <dd style={{ margin: 0 }}>
                <code>{log.action}</code>
              </dd>
            </div>
            <div>
              <dt className="muted">Entity</dt>
              <dd style={{ margin: 0 }}>
                <Link
                  to={`/admin/audit-logs/entity/${log.entityType}/${log.entityId}`}
                >
                  {log.entityType}#{log.entityId}
                </Link>
              </dd>
            </div>
            <div>
              <dt className="muted">IP</dt>
              <dd style={{ margin: 0 }}>
                <code>{log.ipAddress}</code>
              </dd>
            </div>
            <div>
              <dt className="muted">Timestamp</dt>
              <dd style={{ margin: 0 }}>
                {new Date(log.timestamp).toLocaleString()}
              </dd>
            </div>
            <div>
              <dt className="muted">Details</dt>
              <dd style={{ margin: 0 }}>{log.details}</dd>
            </div>
          </dl>
        </div>
      )}
    </div>
  )
}
