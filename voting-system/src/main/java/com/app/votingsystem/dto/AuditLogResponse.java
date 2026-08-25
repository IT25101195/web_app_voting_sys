package com.app.votingsystem.dto;

import java.time.Instant;

public record AuditLogResponse(
        Long id,
        String actor,
        String action,
        String entityType,
        Long entityId,
        String details,
        String ipAddress,
        Instant timestamp
) {
}
