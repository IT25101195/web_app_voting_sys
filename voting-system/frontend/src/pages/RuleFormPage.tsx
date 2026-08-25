import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { complianceApi } from '../api/compliance'
import type {
  ComplianceRuleInput,
  RuleType,
  Severity,
} from '../types/compliance'

const empty: ComplianceRuleInput = {
  name: '',
  ruleType: 'IP_VOTE_SPIKE',
  threshold: 10,
  windowMinutes: 5,
  severity: 'MEDIUM',
  enabled: true,
  description: '',
}

type Props = { mode: 'create' | 'edit' }

export default function RuleFormPage({ mode }: Props) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState<ComplianceRuleInput>(empty)
  const [loading, setLoading] = useState(mode === 'edit')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (mode !== 'edit' || !id) return
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const rule = await complianceApi.getRule(Number(id))
        if (cancelled) return
        setForm({
          name: rule.name,
          ruleType: rule.ruleType,
          threshold: rule.threshold,
          windowMinutes: rule.windowMinutes,
          severity: rule.severity,
          enabled: rule.enabled,
          description: rule.description,
        })
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load rule')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [mode, id])

  function update<K extends keyof ComplianceRuleInput>(
    key: K,
    value: ComplianceRuleInput[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) {
      setError('Name is required')
      return
    }
    if (form.threshold <= 0 || form.windowMinutes <= 0) {
      setError('Threshold and window must be greater than 0')
      return
    }
    setSaving(true)
    setError(null)
    try {
      if (mode === 'create') {
        await complianceApi.createRule(form)
      } else {
        await complianceApi.updateRule(Number(id), form)
      }
      navigate('/admin/compliance/rules')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="muted">Loading…</p>

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>{mode === 'create' ? 'Create rule' : 'Edit rule'}</h2>
          <p>Define a detection threshold for voting compliance.</p>
        </div>
        <Link className="btn" to="/admin/compliance/rules">
          Back to list
        </Link>
      </div>

      {error && <p className="error">{error}</p>}

      <form className="form" onSubmit={(e) => void onSubmit(e)}>
        <label>
          Name
          <input
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            required
          />
        </label>

        <label>
          Rule type
          <select
            value={form.ruleType}
            onChange={(e) => update('ruleType', e.target.value as RuleType)}
          >
            <option value="IP_VOTE_SPIKE">IP_VOTE_SPIKE</option>
            <option value="MAX_VOTES_PER_IP">MAX_VOTES_PER_IP</option>
            <option value="SESSION_THROUGHPUT">SESSION_THROUGHPUT</option>
            <option value="CUSTOM">CUSTOM</option>
          </select>
        </label>

        <label>
          Threshold
          <input
            type="number"
            min={1}
            value={form.threshold}
            onChange={(e) => update('threshold', Number(e.target.value))}
            required
          />
        </label>

        <label>
          Window (minutes)
          <input
            type="number"
            min={1}
            value={form.windowMinutes}
            onChange={(e) => update('windowMinutes', Number(e.target.value))}
            required
          />
        </label>

        <label>
          Severity
          <select
            value={form.severity}
            onChange={(e) => update('severity', e.target.value as Severity)}
          >
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
            <option value="CRITICAL">CRITICAL</option>
          </select>
        </label>

        <label>
          Description
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
          />
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <input
            type="checkbox"
            checked={form.enabled}
            onChange={(e) => update('enabled', e.target.checked)}
          />
          Enabled
        </label>

        <div className="form-actions">
          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? 'Saving…' : mode === 'create' ? 'Create' : 'Save changes'}
          </button>
          <Link className="btn" to="/admin/compliance/rules">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
