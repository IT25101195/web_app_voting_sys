import type {
  AnomalyDTO,
  AuditLog,
  AuditSearchCriteria,
  ComplianceReportDTO,
  ComplianceRule,
  ComplianceRuleInput,
  IntegrityReportDTO,
  PageResult,
  VotingActivityDTO,
} from '../types/compliance'
import * as fixtures from '../mocks/fixtures'
import * as rulesStore from '../mocks/rulesStore'

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8081'

async function request<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers)
  headers.set('Authorization', 'Bearer mock-admin-jwt')
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...init, headers })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `Request failed (${res.status})`)
  }
  if (res.status === 204) return undefined as T
  const contentType = res.headers.get('Content-Type') ?? ''
  if (contentType.includes('application/json')) {
    return (await res.json()) as T
  }
  return (await res.blob()) as T
}

export const complianceApi = {
  listRules(enabled?: boolean): Promise<ComplianceRule[]> {
    if (USE_MOCK) return rulesStore.listRules(enabled)
    const q = enabled === undefined ? '' : `?enabled=${enabled}`
    return request(`/admin/compliance/rules${q}`)
  },

  getRule(id: number): Promise<ComplianceRule> {
    if (USE_MOCK) return rulesStore.getRule(id)
    return request(`/admin/compliance/rules/${id}`)
  },

  createRule(input: ComplianceRuleInput): Promise<ComplianceRule> {
    if (USE_MOCK) return rulesStore.createRule(input)
    return request(`/admin/compliance/rules`, {
      method: 'POST',
      body: JSON.stringify(input),
    })
  },

  updateRule(id: number, input: ComplianceRuleInput): Promise<ComplianceRule> {
    if (USE_MOCK) return rulesStore.updateRule(id, input)
    return request(`/admin/compliance/rules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    })
  },

  deleteRule(id: number): Promise<void> {
    if (USE_MOCK) return rulesStore.deleteRule(id)
    return request(`/admin/compliance/rules/${id}`, { method: 'DELETE' })
  },

  getActivity(sessionId: number): Promise<VotingActivityDTO> {
    if (USE_MOCK) return fixtures.getActivity(sessionId)
    return request(`/admin/compliance/activity?sessionId=${sessionId}`)
  },

  getAnomalies(sessionId: number): Promise<AnomalyDTO[]> {
    if (USE_MOCK) return fixtures.getAnomalies(sessionId)
    return request(`/admin/compliance/anomalies?sessionId=${sessionId}`)
  },

  verifyIntegrity(sessionId: number): Promise<IntegrityReportDTO> {
    if (USE_MOCK) return fixtures.verifyIntegrity(sessionId)
    return request(`/admin/compliance/verify/${sessionId}`)
  },

  generateReport(sessionId: number): Promise<ComplianceReportDTO> {
    if (USE_MOCK) return fixtures.generateReport(sessionId)
    return request(`/admin/compliance/reports/${sessionId}`)
  },

  listAuditLogs(criteria: AuditSearchCriteria = {}): Promise<PageResult<AuditLog>> {
    if (USE_MOCK) return fixtures.listAuditLogs(criteria)
    const params = new URLSearchParams()
    Object.entries(criteria).forEach(([k, v]) => {
      if (v !== undefined && v !== '') params.set(k, String(v))
    })
    const q = params.toString()
    return request(`/admin/audit-logs${q ? `?${q}` : ''}`)
  },

  getAuditLog(id: number): Promise<AuditLog> {
    if (USE_MOCK) return fixtures.getAuditLog(id)
    return request(`/admin/audit-logs/${id}`)
  },

  getAuditLogsByEntity(type: string, entityId: number): Promise<AuditLog[]> {
    if (USE_MOCK) return fixtures.getAuditLogsByEntity(type, entityId)
    return request(`/admin/audit-logs/entity/${type}/${entityId}`)
  },

  purgeAuditLogs(before: string): Promise<number> {
    if (USE_MOCK) return fixtures.purgeAuditLogs(before)
    return request(`/admin/audit-logs/purge?before=${encodeURIComponent(before)}`, {
      method: 'DELETE',
    })
  },

  exportAuditLogs(
    criteria: AuditSearchCriteria = {},
    format: 'csv' | 'json' = 'json',
  ): Promise<Blob> {
    if (USE_MOCK) return fixtures.exportAuditLogs(criteria, format)
    const params = new URLSearchParams()
    Object.entries(criteria).forEach(([k, v]) => {
      if (v !== undefined && v !== '') params.set(k, String(v))
    })
    params.set('format', format)
    return request(`/admin/audit-logs/export?${params.toString()}`)
  },
}

export { MOCK_SESSIONS } from '../mocks/fixtures'
export { USE_MOCK }
