---
name: voting-compliance
description: Implements Voting Compliance & Security admin UI — compliance rules CRUD, activity/anomalies/integrity/reports, and audit logs. Use when building compliance rules, anomaly thresholds, audit trail, or security-officer screens for the voting system.
disable-model-invocation: true
---

# Voting Compliance (Module 6.4)

Frontend lives in `frontend/`. Mock APIs are on by default (`VITE_USE_MOCK=true`).

## Compliance rules CRUD (primary)

| Method | Path |
|--------|------|
| GET | `/admin/compliance/rules` |
| GET | `/admin/compliance/rules/{id}` |
| POST | `/admin/compliance/rules` |
| PUT | `/admin/compliance/rules/{id}` |
| DELETE | `/admin/compliance/rules/{id}` |

`ComplianceRule`: `id`, `name`, `ruleType` (`IP_VOTE_SPIKE` \| `MAX_VOTES_PER_IP` \| `SESSION_THROUGHPUT` \| `CUSTOM`), `threshold`, `windowMinutes`, `severity`, `enabled`, `description`, `createdAt`, `updatedAt`.

UI: `/admin/compliance/rules`, `/new`, `/:id/edit` — list, create, edit, delete, enable toggle.

## Module 6.4 read APIs

| Method | Path |
|--------|------|
| GET | `/admin/compliance/activity?sessionId=` |
| GET | `/admin/compliance/anomalies?sessionId=` |
| GET | `/admin/compliance/verify/{sessionId}` |
| GET | `/admin/compliance/reports/{sessionId}` |
| GET | `/admin/audit-logs` |
| GET | `/admin/audit-logs/{id}` |
| GET | `/admin/audit-logs/entity/{type}/{entityId}` |
| DELETE | `/admin/audit-logs/purge?before=` |
| GET | `/admin/audit-logs/export` |

DTOs: `VotingActivityDTO`, `AnomalyDTO`, `IntegrityReportDTO`, `ComplianceReportDTO`, `AuditLog` — see `frontend/src/types/compliance.ts`.

## Mock vs live

- Client: `frontend/src/api/compliance.ts`
- Mocks: `frontend/src/mocks/rulesStore.ts`, `fixtures.ts`
- Live default: `VITE_USE_MOCK=false`, `VITE_API_BASE_URL=http://localhost:8081`

## Backend (Spring Boot)

Package: `com.app.votingsystem`

- Entities: `ComplianceRule`, `AuditLog`, plus minimal `Vote`, `VotingSession`, `Contestant`
- Controllers: `AdminComplianceController`, `AdminAuditLogController`
- Services: `ComplianceRuleService`, `ComplianceService`, `AuditLogService`
- `AuditLoggingAspect` logs rule create/update/delete
- H2 in-memory DB; seed data on startup via `ComplianceDataSeeder`

Run: `./mvnw spring-boot:run` then `cd frontend && npm run dev`
