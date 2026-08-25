import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { complianceApi } from '../api/compliance'
import type { ComplianceRule } from '../types/compliance'

export default function RulesListPage() {
  const [rules, setRules] = useState<ComplianceRule[]>([])
  const [enabledFilter, setEnabledFilter] = useState<'all' | 'true' | 'false'>(
    'all',
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<number | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const enabled =
        enabledFilter === 'all' ? undefined : enabledFilter === 'true'
      setRules(await complianceApi.listRules(enabled))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load rules')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [enabledFilter])

  async function toggleEnabled(rule: ComplianceRule) {
    setBusyId(rule.id)
    setError(null)
    try {
      await complianceApi.updateRule(rule.id, {
        name: rule.name,
        ruleType: rule.ruleType,
        threshold: rule.threshold,
        windowMinutes: rule.windowMinutes,
        severity: rule.severity,
        enabled: !rule.enabled,
        description: rule.description,
      })
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Update failed')
    } finally {
      setBusyId(null)
    }
  }

  async function remove(rule: ComplianceRule) {
    if (!window.confirm(`Delete rule "${rule.name}"?`)) return
    setBusyId(rule.id)
    setError(null)
    try {
      await complianceApi.deleteRule(rule.id)
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Compliance rules</h2>
          <p>Thresholds used to flag voting anomalies.</p>
        </div>
        <div className="toolbar">
          <select
            value={enabledFilter}
            onChange={(e) =>
              setEnabledFilter(e.target.value as 'all' | 'true' | 'false')
            }
            aria-label="Filter by enabled"
          >
            <option value="all">All rules</option>
            <option value="true">Enabled only</option>
            <option value="false">Disabled only</option>
          </select>
          <Link className="btn btn-primary" to="/admin/compliance/rules/new">
            Create rule
          </Link>
        </div>
      </div>

      {error && <p className="error">{error}</p>}
      {loading ? (
        <p className="muted">Loading rules…</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Threshold</th>
                <th>Window</th>
                <th>Severity</th>
                <th>Enabled</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rules.length === 0 ? (
                <tr>
                  <td colSpan={7}>No rules found.</td>
                </tr>
              ) : (
                rules.map((rule) => (
                  <tr key={rule.id}>
                    <td>
                      <strong>{rule.name}</strong>
                      {rule.description ? (
                        <div className="muted" style={{ fontSize: '0.85rem' }}>
                          {rule.description}
                        </div>
                      ) : null}
                    </td>
                    <td>
                      <code>{rule.ruleType}</code>
                    </td>
                    <td>{rule.threshold}</td>
                    <td>{rule.windowMinutes}m</td>
                    <td>
                      <span className={`severity ${rule.severity}`}>
                        {rule.severity}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className={`toggle ${rule.enabled ? 'on' : ''}`}
                        aria-pressed={rule.enabled}
                        aria-label={`Toggle ${rule.name}`}
                        disabled={busyId === rule.id}
                        onClick={() => void toggleEnabled(rule)}
                      />
                    </td>
                    <td>
                      <div className="row-actions">
                        <Link
                          className="btn"
                          to={`/admin/compliance/rules/${rule.id}/edit`}
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          className="btn btn-danger"
                          disabled={busyId === rule.id}
                          onClick={() => void remove(rule)}
                        >
                          Delete
                        </button>
                      </div>
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
