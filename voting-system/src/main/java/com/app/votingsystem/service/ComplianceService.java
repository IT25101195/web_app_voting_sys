package com.app.votingsystem.service;

import com.app.votingsystem.dto.AnomalyDTO;
import com.app.votingsystem.dto.ComplianceReportDTO;
import com.app.votingsystem.dto.ContestantCountDTO;
import com.app.votingsystem.dto.IntegrityDiscrepancyDTO;
import com.app.votingsystem.dto.IntegrityReportDTO;
import com.app.votingsystem.dto.VotingActivityDTO;
import com.app.votingsystem.entity.ComplianceRule;
import com.app.votingsystem.entity.Contestant;
import com.app.votingsystem.entity.RuleType;
import com.app.votingsystem.entity.VotingSession;
import com.app.votingsystem.exception.ResourceNotFoundException;
import com.app.votingsystem.repository.ComplianceRuleRepository;
import com.app.votingsystem.repository.ContestantRepository;
import com.app.votingsystem.repository.VoteRepository;
import com.app.votingsystem.repository.VotingSessionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ComplianceService {

    private final VoteRepository voteRepository;
    private final VotingSessionRepository sessionRepository;
    private final ContestantRepository contestantRepository;
    private final ComplianceRuleRepository ruleRepository;

    public ComplianceService(
            VoteRepository voteRepository,
            VotingSessionRepository sessionRepository,
            ContestantRepository contestantRepository,
            ComplianceRuleRepository ruleRepository) {
        this.voteRepository = voteRepository;
        this.sessionRepository = sessionRepository;
        this.contestantRepository = contestantRepository;
        this.ruleRepository = ruleRepository;
    }

    @Transactional(readOnly = true)
    public VotingActivityDTO getActivity(Long sessionId) {
        requireSession(sessionId);
        long total = voteRepository.countBySessionId(sessionId);
        double vpm = votesPerMinute(sessionId, total);

        Map<Long, String> names = contestantNames();
        List<ContestantCountDTO> counts = voteRepository.countByContestant(sessionId).stream()
                .map(row -> {
                    Long contestantId = (Long) row[0];
                    Long voteCount = (Long) row[1];
                    return new ContestantCountDTO(
                            contestantId,
                            names.getOrDefault(contestantId, "Contestant " + contestantId),
                            voteCount);
                })
                .sorted(Comparator.comparing(ContestantCountDTO::voteCount).reversed())
                .toList();

        return new VotingActivityDTO(sessionId, total, round(vpm), counts);
    }

    @Transactional(readOnly = true)
    public List<AnomalyDTO> detectAnomalies(Long sessionId) {
        requireSession(sessionId);
        Instant now = Instant.now();
        List<ComplianceRule> rules = ruleRepository.findByEnabled(true);
        List<AnomalyDTO> anomalies = new ArrayList<>();
        long anomalyId = 1;

        for (ComplianceRule rule : rules) {
            Instant windowEnd = now;
            Instant windowStart = now.minus(Duration.ofMinutes(rule.getWindowMinutes()));

            if (rule.getRuleType() == RuleType.IP_VOTE_SPIKE
                    || rule.getRuleType() == RuleType.MAX_VOTES_PER_IP
                    || rule.getRuleType() == RuleType.CUSTOM) {
                List<Object[]> byIp = voteRepository.countByIpInWindow(sessionId, windowStart, windowEnd);
                for (Object[] row : byIp) {
                    String ip = (String) row[0];
                    long count = (Long) row[1];
                    if (count >= rule.getThreshold()) {
                        anomalies.add(new AnomalyDTO(
                                anomalyId++,
                                rule.getRuleType().name(),
                                rule.getName(),
                                ip,
                                count,
                                windowStart,
                                windowEnd,
                                rule.getSeverity(),
                                "IP exceeded " + rule.getName() + " threshold ("
                                        + rule.getThreshold().longValue() + ") with " + count
                                        + " votes in " + rule.getWindowMinutes() + " minutes."
                        ));
                    }
                }
            } else if (rule.getRuleType() == RuleType.SESSION_THROUGHPUT) {
                long count = voteRepository.countInWindow(sessionId, windowStart, windowEnd);
                double perMinute = rule.getWindowMinutes() == 0
                        ? count
                        : (double) count / rule.getWindowMinutes();
                if (perMinute >= rule.getThreshold()) {
                    anomalies.add(new AnomalyDTO(
                            anomalyId++,
                            rule.getRuleType().name(),
                            rule.getName(),
                            "n/a",
                            count,
                            windowStart,
                            windowEnd,
                            rule.getSeverity(),
                            "Session throughput " + round(perMinute)
                                    + " votes/min exceeded threshold " + rule.getThreshold()
                    ));
                }
            }
        }

        return anomalies;
    }

    @Transactional(readOnly = true)
    public IntegrityReportDTO verifyIntegrity(Long sessionId) {
        VotingSession session = requireSession(sessionId);
        long raw = voteRepository.countBySessionId(sessionId);
        long stored = session.getStoredVoteCount();
        boolean matched = stored == raw;

        List<IntegrityDiscrepancyDTO> discrepancies = new ArrayList<>();
        if (!matched) {
            Map<Long, String> names = contestantNames();
            List<Object[]> byContestant = voteRepository.countByContestant(sessionId);
            long delta = stored - raw;
            if (!byContestant.isEmpty()) {
                Object[] top = byContestant.stream()
                        .max(Comparator.comparingLong(row -> (Long) row[1]))
                        .orElse(byContestant.get(0));
                Long contestantId = (Long) top[0];
                long rawCount = (Long) top[1];
                discrepancies.add(new IntegrityDiscrepancyDTO(
                        contestantId,
                        names.getOrDefault(contestantId, "Contestant " + contestantId),
                        rawCount + delta,
                        rawCount
                ));
            }
        }

        return new IntegrityReportDTO(sessionId, stored, raw, matched, discrepancies);
    }

    @Transactional(readOnly = true)
    public ComplianceReportDTO generateReport(Long sessionId) {
        return new ComplianceReportDTO(
                sessionId,
                Instant.now(),
                getActivity(sessionId),
                detectAnomalies(sessionId),
                verifyIntegrity(sessionId)
        );
    }

    private VotingSession requireSession(Long sessionId) {
        return sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session " + sessionId + " not found"));
    }

    private Map<Long, String> contestantNames() {
        Map<Long, String> names = new HashMap<>();
        for (Contestant c : contestantRepository.findAll()) {
            names.put(c.getId(), c.getName());
        }
        return names;
    }

    private double votesPerMinute(Long sessionId, long total) {
        List<Object[]> ranges = voteRepository.castAtRange(sessionId);
        if (ranges == null || ranges.isEmpty() || total == 0) {
            return 0;
        }
        Object[] range = ranges.get(0);
        if (range == null || range[0] == null || range[1] == null) {
            return 0;
        }
        Instant min = (Instant) range[0];
        Instant max = (Instant) range[1];
        double minutes = Math.max(1.0 / 60.0, Duration.between(min, max).toMillis() / 60_000.0);
        return total / minutes;
    }

    private static double round(double value) {
        return Math.round(value * 10.0) / 10.0;
    }
}
