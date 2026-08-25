package com.app.votingsystem.dto;

import com.app.votingsystem.entity.InvestigationStatus;
import com.app.votingsystem.entity.Severity;

import java.time.Instant;

public record InvestigationResponse(
        Long id,
        String title,
        Long sessionId,
        String anomalyType,
        String ipAddress,
        InvestigationStatus status,
        Severity severity,
        String notes,
        String assignedTo,
        Instant createdAt,
        Instant updatedAt
) {
}
