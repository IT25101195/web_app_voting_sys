import type {
  AnomalyDTO,
  AuditLog,
  AuditSearchCriteria,
  ComplianceReportDTO,
  IntegrityReportDTO,
  PageResult,
  VotingActivityDTO,
} from '../types/compliance'

const activityBySession: Record<number, VotingActivityDTO> = {
  101: {
    sessionId: 101,
    totalVotes: 1842,
    votesPerMinute: 62.4,
    contestantCounts: [
      { contestantId: 1, contestantName: 'Ava Chen', voteCount: 612 },
      { contestantId: 2, contestantName: 'Marcus Reed', voteCount: 540 },
      { contestantId: 3, contestantName: 'Sofia Alvarez', voteCount: 690 },
    ],
  },
  102: {
    sessionId: 102,
    totalVotes: 920,
    votesPerMinute: 31.1,
    contestantCounts: [
      { contestantId: 4, contestantName: 'Jordan Lee', voteCount: 410 },
      { contestantId: 5, contestantName: 'Priya Nair', voteCount: 510 },
    ],
  },
}

const anomaliesBySession: Record<number, AnomalyDTO[]> = {
  101: [
    {
      id: 1,
      type: 'IP_VOTE_SPIKE',
      ruleName: 'IP vote spike',
      ipAddress: '203.0.113.44',
      voteCount: 78,
      windowStart: '2026-08-08T10:00:00.000Z',
      windowEnd: '2026-08-08T10:05:00.000Z',
      severity: 'HIGH',
      message: 'IP exceeded spike threshold (50) with 78 votes in 5 minutes.',
    },
    {
      id: 2,
      type: 'MAX_VOTES_PER_IP',
      ruleName: 'Max votes per IP',
      ipAddress: '198.51.100.12',
      voteCount: 24,
      windowStart: '2026-08-08T09:15:00.000Z',
      windowEnd: '2026-08-08T10:15:00.000Z',
      severity: 'MEDIUM',
      message: 'IP exceeded hourly cap of 20 votes.',
    },
  ],
  102: [
    {
      id: 3,
      type: 'SESSION_THROUGHPUT',
      ruleName: 'Session throughput surge',
      ipAddress: 'n/a',
      voteCount: 540,
      windowStart: '2026-08-07T20:00:00.000Z',
      windowEnd: '2026-08-07T20:01:00.000Z',
      severity: 'CRITICAL',
      message: 'Session throughput burst flagged (rule currently disabled).',
    },
  ],
}

const integrityBySession: Record<number, IntegrityReportDTO> = {
  101: {
    sessionId: 101,
    storedCount: 1842,
    rawCount: 1842,
    matched: true,
    discrepancies: [],
  },
  102: {
    sessionId: 102,
    storedCount: 920,
    rawCount: 918,
    matched: false,
    discrepancies: [
      {
        contestantId: 5,
        contestantName: 'Priya Nair',
        storedCount: 510,
        rawCount: 508,
      },
    ],
  },
}

let auditLogs: AuditLog[] = [
  {
    id: 1,
    actor: 'admin@show.tv',
    action: 'CREATE_RULE',
    entityType: 'ComplianceRule',
    entityId: 1,
    details: 'Created rule "IP vote spike"',
    ipAddress: '10.0.0.8',
    timestamp: '2026-08-01T10:00:00.000Z',
  },
  {
    id: 2,
    actor: 'admin@show.tv',
    action: 'UPDATE_RULE',
    entityType: 'ComplianceRule',
    entityId: 2,
    details: 'Updated threshold to 20',
    ipAddress: '10.0.0.8',
    timestamp: '2026-08-02T14:20:00.000Z',
  },
  {
    id: 3,
    actor: 'viewer:8821',
    action: 'CAST_VOTE',
    entityType: 'Vote',
    entityId: 4401,
    details: 'Vote cast in session 101 for contestant 3',
    ipAddress: '203.0.113.44',
    timestamp: '2026-08-08T10:02:11.000Z',
  },
  {
    id: 4,
    actor: 'security@show.tv',
    action: 'VERIFY_INTEGRITY',
    entityType: 'VotingSession',
    entityId: 102,
    details: 'Integrity check failed: stored 920 vs raw 918',
    ipAddress: '10.0.0.21',
    timestamp: '2026-08-08T11:00:00.000Z',
  },
  {
    id: 5,
    actor: 'admin@show.tv',
    action: 'DISABLE_RULE',
    entityType: 'ComplianceRule',
    entityId: 3,
    details: 'Disabled session throughput surge rule',
    ipAddress: '10.0.0.8',
    timestamp: '2026-08-03T09:05:00.000Z',
  },
]

function delay(ms = 160): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const MOCK_SESSIONS = [
  { id: 101, label: 'Session 101 — Finale live vote' },
  { id: 102, label: 'Session 102 — Semifinal recap' },
]

export async function getActivity(sessionId: number): Promise<VotingActivityDTO> {
  await delay()
  const data = activityBySession[sessionId]
  if (!data) throw new Error(`No activity for session ${sessionId}`)
  return structuredClone(data)
}

export async function getAnomalies(sessionId: number): Promise<AnomalyDTO[]> {
  await delay()
  return structuredClone(anomaliesBySession[sessionId] ?? [])
}

export async function verifyIntegrity(
  sessionId: number,
): Promise<IntegrityReportDTO> {
  await delay()
  const data = integrityBySession[sessionId]
  if (!data) throw new Error(`No integrity data for session ${sessionId}`)
  return structuredClone(data)
}

export async function generateReport(
  sessionId: number,
): Promise<ComplianceReportDTO> {
  await delay()
  const activity = await getActivity(sessionId)
  const anomalies = await getAnomalies(sessionId)
  const integrity = await verifyIntegrity(sessionId)
  return {
    sessionId,
    generatedAt: new Date().toISOString(),
    activity,
    anomalies,
    integrity,
  }
}

export async function listAuditLogs(
  criteria: AuditSearchCriteria = {},
): Promise<PageResult<AuditLog>> {
  await delay()
  const page = criteria.page ?? 0
  const size = criteria.size ?? 10
  let filtered = [...auditLogs]

  if (criteria.actor) {
    const q = criteria.actor.toLowerCase()
    filtered = filtered.filter((l) => l.actor.toLowerCase().includes(q))
  }
  if (criteria.action) {
    const q = criteria.action.toLowerCase()
    filtered = filtered.filter((l) => l.action.toLowerCase().includes(q))
  }
  if (criteria.entityType) {
    const q = criteria.entityType.toLowerCase()
    filtered = filtered.filter((l) => l.entityType.toLowerCase().includes(q))
  }
  if (criteria.from) {
    filtered = filtered.filter((l) => l.timestamp >= criteria.from!)
  }
  if (criteria.to) {
    filtered = filtered.filter((l) => l.timestamp <= criteria.to!)
  }

  filtered.sort((a, b) => b.timestamp.localeCompare(a.timestamp))
  const totalElements = filtered.length
  const totalPages = Math.max(1, Math.ceil(totalElements / size))
  const start = page * size
  const content = filtered.slice(start, start + size)

  return { content, page, size, totalElements, totalPages }
}

export async function getAuditLog(id: number): Promise<AuditLog> {
  await delay()
  const log = auditLogs.find((l) => l.id === id)
  if (!log) throw new Error(`Audit log ${id} not found`)
  return { ...log }
}

export async function getAuditLogsByEntity(
  type: string,
  entityId: number,
): Promise<AuditLog[]> {
  await delay()
  return auditLogs
    .filter(
      (l) =>
        l.entityType.toLowerCase() === type.toLowerCase() &&
        l.entityId === entityId,
    )
    .map((l) => ({ ...l }))
}

export async function purgeAuditLogs(before: string): Promise<number> {
  await delay()
  const beforeTs = before
  const remaining = auditLogs.filter((l) => l.timestamp >= beforeTs)
  const removed = auditLogs.length - remaining.length
  auditLogs = remaining
  return removed
}

export async function exportAuditLogs(
  criteria: AuditSearchCriteria = {},
  format: 'csv' | 'json' = 'json',
): Promise<Blob> {
  const page = await listAuditLogs({ ...criteria, page: 0, size: 1000 })
  if (format === 'json') {
    return new Blob([JSON.stringify(page.content, null, 2)], {
      type: 'application/json',
    })
  }
  const header = 'id,actor,action,entityType,entityId,details,ipAddress,timestamp'
  const rows = page.content.map((l) =>
    [
      l.id,
      JSON.stringify(l.actor),
      l.action,
      l.entityType,
      l.entityId,
      JSON.stringify(l.details),
      l.ipAddress,
      l.timestamp,
    ].join(','),
  )
  return new Blob([[header, ...rows].join('\n')], { type: 'text/csv' })
}
