package com.app.votingsystem.controller.admin;

import com.app.votingsystem.dto.AnomalyDTO;
import com.app.votingsystem.dto.ComplianceReportDTO;
import com.app.votingsystem.dto.ComplianceRuleRequest;
import com.app.votingsystem.dto.ComplianceRuleResponse;
import com.app.votingsystem.dto.IntegrityReportDTO;
import com.app.votingsystem.dto.VotingActivityDTO;
import com.app.votingsystem.dto.VotingSessionResponse;
import com.app.votingsystem.service.ComplianceRuleService;
import com.app.votingsystem.service.ComplianceService;
import com.app.votingsystem.service.VotingSessionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/admin/compliance")
public class AdminComplianceController {

    private final ComplianceService complianceService;
    private final ComplianceRuleService ruleService;
    private final VotingSessionService sessionService;

    public AdminComplianceController(
            ComplianceService complianceService,
            ComplianceRuleService ruleService,
            VotingSessionService sessionService) {
        this.complianceService = complianceService;
        this.ruleService = ruleService;
        this.sessionService = sessionService;
    }

    @GetMapping("/sessions")
    public List<VotingSessionResponse> listSessions() {
        return sessionService.list();
    }

    @GetMapping("/rules")
    public List<ComplianceRuleResponse> listRules(
            @RequestParam(required = false) Boolean enabled) {
        return ruleService.list(enabled);
    }

    @GetMapping("/rules/{id}")
    public ComplianceRuleResponse getRule(@PathVariable Long id) {
        return ruleService.get(id);
    }

    @PostMapping("/rules")
    @ResponseStatus(HttpStatus.CREATED)
    public ComplianceRuleResponse createRule(@Valid @RequestBody ComplianceRuleRequest request) {
        return ruleService.create(request);
    }

    @PutMapping("/rules/{id}")
    public ComplianceRuleResponse updateRule(
            @PathVariable Long id,
            @Valid @RequestBody ComplianceRuleRequest request) {
        return ruleService.update(id, request);
    }

    @DeleteMapping("/rules/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteRule(@PathVariable Long id) {
        ruleService.delete(id);
    }

    @GetMapping("/activity")
    public VotingActivityDTO activity(@RequestParam Long sessionId) {
        return complianceService.getActivity(sessionId);
    }

    @GetMapping("/anomalies")
    public List<AnomalyDTO> anomalies(@RequestParam Long sessionId) {
        return complianceService.detectAnomalies(sessionId);
    }

    @GetMapping("/verify/{sessionId}")
    public IntegrityReportDTO verify(@PathVariable Long sessionId) {
        return complianceService.verifyIntegrity(sessionId);
    }

    @GetMapping("/reports/{sessionId}")
    public ComplianceReportDTO report(@PathVariable Long sessionId) {
        return complianceService.generateReport(sessionId);
    }
}
