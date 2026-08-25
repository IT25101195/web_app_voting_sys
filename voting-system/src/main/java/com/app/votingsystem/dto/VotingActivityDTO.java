package com.app.votingsystem.dto;

import java.util.List;

public record VotingActivityDTO(
        Long sessionId,
        Long totalVotes,
        Double votesPerMinute,
        List<ContestantCountDTO> contestantCounts
) {
}
