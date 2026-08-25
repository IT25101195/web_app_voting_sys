import { useEffect, useState } from 'react'
import { complianceApi } from '../api/compliance'
import type { VotingActivityDTO } from '../types/compliance'
import SessionPicker from '../components/SessionPicker'
import ContestantVotesChart from '../charts/ContestantVotesChart'
import VoteSharePieChart from '../charts/VoteSharePieChart'

export default function ActivityPage() {
  const [sessionId, setSessionId] = useState(101)
  const [data, setData] = useState<VotingActivityDTO | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const activity = await complianceApi.getActivity(sessionId)
        if (!cancelled) setData(activity)
      } catch (e) {
        if (!cancelled) {
          setData(null)
          setError(e instanceof Error ? e.message : 'Failed to load activity')
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
          <h2>Voting activity</h2>
          <p>Near-real-time throughput and per-contestant counts.</p>
        </div>
        <SessionPicker sessionId={sessionId} onChange={setSessionId} />
      </div>

      {error && <p className="error">{error}</p>}
      {loading && <p className="muted">Loading…</p>}

      {data && !loading && (
        <>
          <div className="stat-row">
            <div className="stat">
              <div className="label">Total votes</div>
              <div className="value">{data.totalVotes}</div>
            </div>
            <div className="stat">
              <div className="label">Votes / min</div>
              <div className="value">{data.votesPerMinute}</div>
            </div>
            <div className="stat">
              <div className="label">Contestants</div>
              <div className="value">{data.contestantCounts.length}</div>
            </div>
          </div>

          <div className="chart-grid">
            <ContestantVotesChart
              contestantCounts={data.contestantCounts}
              title={`Session ${data.sessionId} — votes by contestant`}
            />
            <VoteSharePieChart
              contestantCounts={data.contestantCounts}
              title={`Session ${data.sessionId} — vote share`}
            />
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Contestant</th>
                  <th>Votes</th>
                </tr>
              </thead>
              <tbody>
                {data.contestantCounts.map((c) => (
                  <tr key={c.contestantId}>
                    <td>{c.contestantName}</td>
                    <td>{c.voteCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
