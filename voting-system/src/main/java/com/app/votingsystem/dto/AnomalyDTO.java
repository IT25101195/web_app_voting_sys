package com.app.votingsystem.dto;

import com.app.votingsystem.entity.Severity;

import java.time.Instant;

public record AnomalyDTO(
        Long id,
        String type,
        String ruleName,
        String ipAddress,
        Long voteCount,
        Instant windowStart,
        Instant windowEnd,
        Severity severity,
        String message
) {
}
