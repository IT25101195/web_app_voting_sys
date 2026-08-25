import { useEffect, useState } from 'react'
import { complianceApi } from '../api/compliance'
import type { IntegrityReportDTO } from '../types/compliance'
import SessionPicker from '../components/SessionPicker'

export default function VerifyPage() {
  const [sessionId, setSessionId] = useState(101)
  const [report, setReport] = useState<IntegrityReportDTO | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await complianceApi.verifyIntegrity(sessionId)
        if (!cancelled) setReport(data)
      } catch (e) {
        if (!cancelled) {
          setReport(null)
          setError(e instanceof Error ? e.message : 'Verification failed')
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
          <h2>Integrity verify</h2>
          <p>Reconcile stored counts against raw vote records.</p>
        </div>
        <SessionPicker sessionId={sessionId} onChange={setSessionId} />
      </div>

      {error && <p className="error">{error}</p>}
      {loading && <p className="muted">Verifying…</p>}

      {report && !loading && (
        <>
          <div className="panel">
            <h3 className={report.matched ? 'status-ok' : 'status-fail'}>
              {report.matched ? 'Matched' : 'Mismatch detected'}
            </h3>
            <div className="stat-row" style={{ marginTop: '1rem', marginBottom: 0 }}>
              <div className="stat">
                <div className="label">Stored count</div>
                <div className="value">{report.storedCount}</div>
              </div>
              <div className="stat">
                <div className="label">Raw count</div>
                <div className="value">{report.rawCount}</div>
              </div>
              <div className="stat">
                <div className="label">Delta</div>
                <div className="value">
                  {report.storedCount - report.rawCount}
                </div>
              </div>
            </div>
          </div>

          {report.discrepancies.length > 0 && (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Contestant</th>
                    <th>Stored</th>
                    <th>Raw</th>
                  </tr>
                </thead>
                <tbody>
                  {report.discrepancies.map((d) => (
                    <tr key={d.contestantId}>
                      <td>{d.contestantName}</td>
                      <td>{d.storedCount}</td>
                      <td>{d.rawCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}
