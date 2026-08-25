import { Navigate, Route, Routes } from 'react-router-dom'
import AdminLayout from './layout/AdminLayout'
import RulesListPage from './pages/RulesListPage'
import RuleFormPage from './pages/RuleFormPage'
import ActivityPage from './pages/ActivityPage'
import AnomaliesPage from './pages/AnomaliesPage'
import VerifyPage from './pages/VerifyPage'
import ReportsPage from './pages/ReportsPage'
import AuditLogsPage from './pages/AuditLogsPage'
import AuditLogDetailPage from './pages/AuditLogDetailPage'
import AuditByEntityPage from './pages/AuditByEntityPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin/compliance/rules" replace />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route path="compliance/rules" element={<RulesListPage />} />
        <Route path="compliance/rules/new" element={<RuleFormPage mode="create" />} />
        <Route path="compliance/rules/:id/edit" element={<RuleFormPage mode="edit" />} />
        <Route path="compliance" element={<ActivityPage />} />
        <Route path="compliance/anomalies" element={<AnomaliesPage />} />
        <Route path="compliance/verify" element={<VerifyPage />} />
        <Route path="compliance/reports" element={<ReportsPage />} />
        <Route path="audit-logs" element={<AuditLogsPage />} />
        <Route path="audit-logs/:id" element={<AuditLogDetailPage />} />
        <Route
          path="audit-logs/entity/:type/:entityId"
          element={<AuditByEntityPage />}
        />
      </Route>
      <Route path="*" element={<Navigate to="/admin/compliance/rules" replace />} />
    </Routes>
  )
}
