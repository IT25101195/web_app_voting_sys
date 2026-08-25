package com.app.votingsystem.service;

import com.app.votingsystem.dto.ComplianceRuleRequest;
import com.app.votingsystem.dto.ComplianceRuleResponse;
import com.app.votingsystem.entity.ComplianceRule;
import com.app.votingsystem.exception.ResourceNotFoundException;
import com.app.votingsystem.repository.ComplianceRuleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ComplianceRuleService {

    private final ComplianceRuleRepository repository;

    public ComplianceRuleService(ComplianceRuleRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<ComplianceRuleResponse> list(Boolean enabled) {
        List<ComplianceRule> rules = enabled == null
                ? repository.findAll()
                : repository.findByEnabled(enabled);
        return rules.stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public ComplianceRuleResponse get(Long id) {
        return toResponse(find(id));
    }

    @Transactional
    public ComplianceRuleResponse create(ComplianceRuleRequest request) {
        ComplianceRule rule = new ComplianceRule();
        apply(rule, request);
        return toResponse(repository.save(rule));
    }

    @Transactional
    public ComplianceRuleResponse update(Long id, ComplianceRuleRequest request) {
        ComplianceRule rule = find(id);
        apply(rule, request);
        return toResponse(repository.save(rule));
    }

    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Rule " + id + " not found");
        }
        repository.deleteById(id);
    }

    private ComplianceRule find(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rule " + id + " not found"));
    }

    private void apply(ComplianceRule rule, ComplianceRuleRequest request) {
        rule.setName(request.getName().trim());
        rule.setRuleType(request.getRuleType());
        rule.setThreshold(request.getThreshold());
        rule.setWindowMinutes(request.getWindowMinutes());
        rule.setSeverity(request.getSeverity());
        rule.setEnabled(request.getEnabled());
        rule.setDescription(request.getDescription() == null ? "" : request.getDescription());
    }

    private ComplianceRuleResponse toResponse(ComplianceRule rule) {
        return new ComplianceRuleResponse(
                rule.getId(),
                rule.getName(),
                rule.getRuleType(),
                rule.getThreshold(),
                rule.getWindowMinutes(),
                rule.getSeverity(),
                rule.getEnabled(),
                rule.getDescription(),
                rule.getCreatedAt(),
                rule.getUpdatedAt()
        );
    }
}
