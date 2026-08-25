import type { ComplianceRule, ComplianceRuleInput } from '../types/compliance'

const now = () => new Date().toISOString()

let nextId = 5

let rules: ComplianceRule[] = [
  {
    id: 1,
    name: 'IP vote spike',
    ruleType: 'IP_VOTE_SPIKE',
    threshold: 50,
    windowMinutes: 5,
    severity: 'HIGH',
    enabled: true,
    description: 'Flag when a single IP casts more than 50 votes in 5 minutes.',
    createdAt: '2026-08-01T10:00:00.000Z',
    updatedAt: '2026-08-01T10:00:00.000Z',
  },
  {
    id: 2,
    name: 'Max votes per IP',
    ruleType: 'MAX_VOTES_PER_IP',
    threshold: 20,
    windowMinutes: 60,
    severity: 'MEDIUM',
    enabled: true,
    description: 'Cap votes from one IP to 20 per hour within a session.',
    createdAt: '2026-08-01T10:05:00.000Z',
    updatedAt: '2026-08-02T14:20:00.000Z',
  },
  {
    id: 3,
    name: 'Session throughput surge',
    ruleType: 'SESSION_THROUGHPUT',
    threshold: 500,
    windowMinutes: 1,
    severity: 'CRITICAL',
    enabled: false,
    description: 'Alert when session exceeds 500 votes per minute.',
    createdAt: '2026-08-03T09:00:00.000Z',
    updatedAt: '2026-08-03T09:00:00.000Z',
  },
  {
    id: 4,
    name: 'Custom geo cluster',
    ruleType: 'CUSTOM',
    threshold: 100,
    windowMinutes: 15,
    severity: 'LOW',
    enabled: true,
    description: 'Custom rule for clustered voting from related subnets.',
    createdAt: '2026-08-04T11:30:00.000Z',
    updatedAt: '2026-08-04T11:30:00.000Z',
  },
]

function delay(ms = 180): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function listRules(enabled?: boolean): Promise<ComplianceRule[]> {
  await delay()
  if (enabled === undefined) return [...rules]
  return rules.filter((r) => r.enabled === enabled)
}

export async function getRule(id: number): Promise<ComplianceRule> {
  await delay()
  const rule = rules.find((r) => r.id === id)
  if (!rule) throw new Error(`Rule ${id} not found`)
  return { ...rule }
}

export async function createRule(
  input: ComplianceRuleInput,
): Promise<ComplianceRule> {
  await delay()
  const stamp = now()
  const rule: ComplianceRule = {
    ...input,
    id: nextId++,
    createdAt: stamp,
    updatedAt: stamp,
  }
  rules = [...rules, rule]
  return { ...rule }
}

export async function updateRule(
  id: number,
  input: ComplianceRuleInput,
): Promise<ComplianceRule> {
  await delay()
  const index = rules.findIndex((r) => r.id === id)
  if (index < 0) throw new Error(`Rule ${id} not found`)
  const updated: ComplianceRule = {
    ...rules[index],
    ...input,
    id,
    updatedAt: now(),
  }
  rules = rules.map((r, i) => (i === index ? updated : r))
  return { ...updated }
}

export async function deleteRule(id: number): Promise<void> {
  await delay()
  const exists = rules.some((r) => r.id === id)
  if (!exists) throw new Error(`Rule ${id} not found`)
  rules = rules.filter((r) => r.id !== id)
}
