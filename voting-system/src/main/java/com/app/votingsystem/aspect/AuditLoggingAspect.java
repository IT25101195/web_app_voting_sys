package com.app.votingsystem.aspect;

import com.app.votingsystem.dto.ComplianceRuleResponse;
import com.app.votingsystem.dto.InvestigationResponse;
import com.app.votingsystem.service.AuditLogService;
import jakarta.servlet.http.HttpServletRequest;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Aspect
@Component
public class AuditLoggingAspect {

    private final AuditLogService auditLogService;

    public AuditLoggingAspect(AuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    @Pointcut("execution(* com.app.votingsystem.controller.admin.AdminComplianceController.createRule(..))")
    void createRule() {
    }

    @Pointcut("execution(* com.app.votingsystem.controller.admin.AdminComplianceController.updateRule(..))")
    void updateRule() {
    }

    @Pointcut("execution(* com.app.votingsystem.controller.admin.AdminComplianceController.deleteRule(..))")
    void deleteRule() {
    }

    @Pointcut("execution(* com.app.votingsystem.controller.admin.AdminInvestigationController.create(..))")
    void createInvestigation() {
    }

    @Pointcut("execution(* com.app.votingsystem.controller.admin.AdminInvestigationController.update(..))")
    void updateInvestigation() {
    }

    @Pointcut("execution(* com.app.votingsystem.controller.admin.AdminInvestigationController.delete(..))")
    void deleteInvestigation() {
    }

    @AfterReturning(pointcut = "createRule()", returning = "result")
    public void afterCreate(JoinPoint jp, ComplianceRuleResponse result) {
        auditLogService.log(
                actor(),
                "CREATE_RULE",
                "ComplianceRule",
                result.id(),
                "Created rule \"" + result.name() + "\"",
                clientIp());
    }

    @AfterReturning(pointcut = "updateRule()", returning = "result")
    public void afterUpdate(JoinPoint jp, ComplianceRuleResponse result) {
        auditLogService.log(
                actor(),
                "UPDATE_RULE",
                "ComplianceRule",
                result.id(),
                "Updated rule \"" + result.name() + "\"",
                clientIp());
    }

    @AfterReturning(pointcut = "deleteRule()")
    public void afterDelete(JoinPoint jp) {
        Object[] args = jp.getArgs();
        Long id = args.length > 0 && args[0] instanceof Long ? (Long) args[0] : null;
        auditLogService.log(
                actor(),
                "DELETE_RULE",
                "ComplianceRule",
                id,
                "Deleted rule " + id,
                clientIp());
    }

    @AfterReturning(pointcut = "createInvestigation()", returning = "result")
    public void afterCreateInvestigation(JoinPoint jp, InvestigationResponse result) {
        auditLogService.log(
                actor(),
                "CREATE_INVESTIGATION",
                "Investigation",
                result.id(),
                "Created investigation \"" + result.title() + "\"",
                clientIp());
    }

    @AfterReturning(pointcut = "updateInvestigation()", returning = "result")
    public void afterUpdateInvestigation(JoinPoint jp, InvestigationResponse result) {
        auditLogService.log(
                actor(),
                "UPDATE_INVESTIGATION",
                "Investigation",
                result.id(),
                "Updated investigation \"" + result.title() + "\"",
                clientIp());
    }

    @AfterReturning(pointcut = "deleteInvestigation()")
    public void afterDeleteInvestigation(JoinPoint jp) {
        Object[] args = jp.getArgs();
        Long id = args.length > 0 && args[0] instanceof Long ? (Long) args[0] : null;
        auditLogService.log(
                actor(),
                "DELETE_INVESTIGATION",
                "Investigation",
                id,
                "Deleted investigation " + id,
                clientIp());
    }

    private String actor() {
        HttpServletRequest request = currentRequest();
        if (request == null) {
            return "system";
        }
        String auth = request.getHeader("Authorization");
        if (auth != null && auth.startsWith("Bearer ")) {
            return "admin@show.tv";
        }
        return "anonymous";
    }

    private String clientIp() {
        HttpServletRequest request = currentRequest();
        return request == null ? "unknown" : request.getRemoteAddr();
    }

    private HttpServletRequest currentRequest() {
        var attrs = RequestContextHolder.getRequestAttributes();
        if (attrs instanceof ServletRequestAttributes servletAttrs) {
            return servletAttrs.getRequest();
        }
        return null;
    }
}
