export type RuleType =
  | 'IP_VOTE_SPIKE'
  | 'MAX_VOTES_PER_IP'
  | 'SESSION_THROUGHPUT'
  | 'CUSTOM'

export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export interface ComplianceRule {
  id: number
  name: string
  ruleType: RuleType
  threshold: number
  windowMinutes: number
  severity: Severity
  enabled: boolean
  description: string
  createdAt: string
  updatedAt: string
}

export type ComplianceRuleInput = Omit<
  ComplianceRule,
  'id' | 'createdAt' | 'updatedAt'
>

export interface ContestantCount {
  contestantId: number
  contestantName: string
  voteCount: number
}

export interface VotingActivityDTO {
  sessionId: number
  totalVotes: number
  votesPerMinute: number
  contestantCounts: ContestantCount[]
}

export interface AnomalyDTO {
  id: number
  type: string
  ruleName?: string
  ipAddress: string
  voteCount: number
  windowStart: string
  windowEnd: string
  severity: Severity
  message: string
}

export interface IntegrityDiscrepancy {
  contestantId: number
  contestantName: string
  storedCount: number
  rawCount: number
}

export interface IntegrityReportDTO {
  sessionId: number
  storedCount: number
  rawCount: number
  matched: boolean
  discrepancies: IntegrityDiscrepancy[]
}

export interface ComplianceReportDTO {
  sessionId: number
  generatedAt: string
  activity: VotingActivityDTO
  anomalies: AnomalyDTO[]
  integrity: IntegrityReportDTO
}

export interface AuditLog {
  id: number
  actor: string
  action: string
  entityType: string
  entityId: number
  details: string
  ipAddress: string
  timestamp: string
}

export interface AuditSearchCriteria {
  actor?: string
  action?: string
  entityType?: string
  from?: string
  to?: string
  page?: number
  size?: number
}

export interface PageResult<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}
