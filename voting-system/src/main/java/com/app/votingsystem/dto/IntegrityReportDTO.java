package com.app.votingsystem.dto;

import java.util.List;

public record IntegrityReportDTO(
        Long sessionId,
        Long storedCount,
        Long rawCount,
        boolean matched,
        List<IntegrityDiscrepancyDTO> discrepancies
) {
}
