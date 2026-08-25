import { MOCK_SESSIONS } from '../api/compliance'

type Props = {
  sessionId: number
  onChange: (id: number) => void
}

export default function SessionPicker({ sessionId, onChange }: Props) {
  return (
    <label className="toolbar" style={{ gap: '0.5rem' }}>
      <span className="muted">Session</span>
      <select
        value={sessionId}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label="Voting session"
      >
        {MOCK_SESSIONS.map((s) => (
          <option key={s.id} value={s.id}>
            {s.label}
          </option>
        ))}
      </select>
    </label>
  )
}
