package com.app.votingsystem.dto;

import java.time.Instant;
import java.util.List;

public record ComplianceReportDTO(
        Long sessionId,
        Instant generatedAt,
        VotingActivityDTO activity,
        List<AnomalyDTO> anomalies,
        IntegrityReportDTO integrity
) {
}
