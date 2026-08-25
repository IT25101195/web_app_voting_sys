import { useEffect, useState } from 'react'
import { complianceApi } from '../api/compliance'
import type { ComplianceReportDTO } from '../types/compliance'
import SessionPicker from '../components/SessionPicker'
import ContestantVotesChart from '../charts/ContestantVotesChart'
import VoteSharePieChart from '../charts/VoteSharePieChart'
import AnomalySeverityChart from '../charts/AnomalySeverityChart'

export default function ReportsPage() {
  const [sessionId, setSessionId] = useState(101)
  const [report, setReport] = useState<ComplianceReportDTO | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await complianceApi.generateReport(sessionId)
        if (!cancelled) setReport(data)
      } catch (e) {
        if (!cancelled) {
          setReport(null)
          setError(e instanceof Error ? e.message : 'Failed to generate report')
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
          <h2>Compliance report</h2>
          <p>Audit-ready summary for a voting session.</p>
        </div>
        <SessionPicker sessionId={sessionId} onChange={setSessionId} />
      </div>

      {error && <p className="error">{error}</p>}
      {loading && <p className="muted">Generating…</p>}

      {report && !loading && (
        <>
          <div className="panel">
            <p className="muted" style={{ marginBottom: '0.5rem' }}>
              Generated {new Date(report.generatedAt).toLocaleString()} · Session{' '}
              {report.sessionId}
            </p>
            <div className="stat-row" style={{ marginBottom: 0 }}>
              <div className="stat">
                <div className="label">Total votes</div>
                <div className="value">{report.activity.totalVotes}</div>
              </div>
              <div className="stat">
                <div className="label">Anomalies</div>
                <div className="value">{report.anomalies.length}</div>
              </div>
              <div className="stat">
                <div className="label">Integrity</div>
                <div
                  className={`value ${report.integrity.matched ? 'status-ok' : 'status-fail'}`}
                >
                  {report.integrity.matched ? 'OK' : 'FAIL'}
                </div>
              </div>
            </div>
          </div>

          <div className="chart-grid">
            <ContestantVotesChart
              contestantCounts={report.activity.contestantCounts}
              title="Report — votes by contestant"
            />
            <VoteSharePieChart
              contestantCounts={report.activity.contestantCounts}
              title="Report — vote share"
            />
          </div>

          <AnomalySeverityChart anomalies={report.anomalies} />

          <h3 style={{ marginTop: '1.25rem' }}>Anomalies in report</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Severity</th>
                  <th>Rule</th>
                  <th>Message</th>
                </tr>
              </thead>
              <tbody>
                {report.anomalies.length === 0 ? (
                  <tr>
                    <td colSpan={3}>None</td>
                  </tr>
                ) : (
                  report.anomalies.map((a) => (
                    <tr key={a.id}>
                      <td>
                        <span className={`severity ${a.severity}`}>{a.severity}</span>
                      </td>
                      <td>{a.ruleName ?? a.type}</td>
                      <td>{a.message}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
