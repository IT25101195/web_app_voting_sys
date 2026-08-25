import { useEffect, useState } from 'react'
import { complianceApi } from '../api/compliance'
import type { AnomalyDTO } from '../types/compliance'
import SessionPicker from '../components/SessionPicker'

export default function AnomaliesPage() {
  const [sessionId, setSessionId] = useState(101)
  const [items, setItems] = useState<AnomalyDTO[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const anomalies = await complianceApi.getAnomalies(sessionId)
        if (!cancelled) setItems(anomalies)
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load anomalies')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [sessionId])

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Anomalies</h2>
          <p>IP spikes and patterns flagged against compliance rules.</p>
        </div>
        <SessionPicker sessionId={sessionId} onChange={setSessionId} />
      </div>

      {error && <p className="error">{error}</p>}
      {loading ? (
        <p className="muted">Loading…</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Severity</th>
                <th>Type / rule</th>
                <th>IP</th>
                <th>Votes</th>
                <th>Window</th>
                <th>Message</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={6}>No anomalies for this session.</td>
                </tr>
              ) : (
                items.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <span className={`severity ${a.severity}`}>{a.severity}</span>
                    </td>
                    <td>
                      <code>{a.type}</code>
                      {a.ruleName ? (
                        <div className="muted" style={{ fontSize: '0.85rem' }}>
                          {a.ruleName}
                        </div>
                      ) : null}
                    </td>
                    <td>
                      <code>{a.ipAddress}</code>
                    </td>
                    <td>{a.voteCount}</td>
                    <td style={{ fontSize: '0.85rem' }}>
                      {new Date(a.windowStart).toLocaleString()} →{' '}
                      {new Date(a.windowEnd).toLocaleString()}
                    </td>
                    <td>{a.message}</td>
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
