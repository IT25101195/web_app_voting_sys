package com.app.votingsystem.dto;

public record IntegrityDiscrepancyDTO(
        Long contestantId,
        String contestantName,
        Long storedCount,
        Long rawCount
) {
}
