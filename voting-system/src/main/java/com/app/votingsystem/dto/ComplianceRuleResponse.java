package com.app.votingsystem.dto;

import com.app.votingsystem.entity.RuleType;
import com.app.votingsystem.entity.Severity;

import java.time.Instant;

public record ComplianceRuleResponse(
        Long id,
        String name,
        RuleType ruleType,
        Double threshold,
        Integer windowMinutes,
        Severity severity,
        Boolean enabled,
        String description,
        Instant createdAt,
        Instant updatedAt
) {
}
