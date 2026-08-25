package com.app.votingsystem.config;

import com.app.votingsystem.entity.AuditLog;
import com.app.votingsystem.entity.ComplianceRule;
import com.app.votingsystem.entity.Contestant;
import com.app.votingsystem.entity.RuleType;
import com.app.votingsystem.entity.Severity;
import com.app.votingsystem.entity.Vote;
import com.app.votingsystem.entity.VotingSession;
import com.app.votingsystem.entity.Investigation;
import com.app.votingsystem.entity.InvestigationStatus;
import com.app.votingsystem.repository.AuditLogRepository;
import com.app.votingsystem.repository.InvestigationRepository;
import com.app.votingsystem.repository.ComplianceRuleRepository;
import com.app.votingsystem.repository.ContestantRepository;
import com.app.votingsystem.repository.VoteRepository;
import com.app.votingsystem.repository.VotingSessionRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Component
public class ComplianceDataSeeder implements ApplicationRunner {

    private final ComplianceRuleRepository ruleRepository;
    private final ContestantRepository contestantRepository;
    private final VotingSessionRepository sessionRepository;
    private final VoteRepository voteRepository;
    private final AuditLogRepository auditLogRepository;
    private final InvestigationRepository investigationRepository;

    public ComplianceDataSeeder(
            ComplianceRuleRepository ruleRepository,
            ContestantRepository contestantRepository,
            VotingSessionRepository sessionRepository,
            VoteRepository voteRepository,
            AuditLogRepository auditLogRepository,
            InvestigationRepository investigationRepository) {
        this.ruleRepository = ruleRepository;
        this.contestantRepository = contestantRepository;
        this.sessionRepository = sessionRepository;
        this.voteRepository = voteRepository;
        this.auditLogRepository = auditLogRepository;
        this.investigationRepository = investigationRepository;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (ruleRepository.count() > 0) {
            return;
        }

        seedRules();
        seedContestantsAndSessions();
        long session101Votes = seedVotesSession101();
        long session102Votes = seedVotesSession102();

        VotingSession s101 = sessionRepository.findById(101L).orElseThrow();
        s101.setStoredVoteCount(session101Votes);
        sessionRepository.save(s101);

        VotingSession s102 = sessionRepository.findById(102L).orElseThrow();
        s102.setStoredVoteCount(session102Votes + 2);
        sessionRepository.save(s102);

        seedAuditLogs();
        seedInvestigations();
    }

    private void seedRules() {
        ruleRepository.save(rule(
                "IP vote spike",
                RuleType.IP_VOTE_SPIKE,
                50,
                5,
                Severity.HIGH,
                true,
                "Flag when a single IP casts more than 50 votes in 5 minutes."));
        ruleRepository.save(rule(
                "Max votes per IP",
                RuleType.MAX_VOTES_PER_IP,
                20,
                60,
                Severity.MEDIUM,
                true,
                "Cap votes from one IP to 20 per hour within a session."));
        ruleRepository.save(rule(
                "Session throughput surge",
                RuleType.SESSION_THROUGHPUT,
                500,
                1,
                Severity.CRITICAL,
                false,
                "Alert when session exceeds 500 votes per minute."));
        ruleRepository.save(rule(
                "Custom geo cluster",
                RuleType.CUSTOM,
                100,
                15,
                Severity.LOW,
                true,
                "Custom rule for clustered voting from related subnets."));
    }

    private ComplianceRule rule(
            String name,
            RuleType type,
            double threshold,
            int window,
            Severity severity,
            boolean enabled,
            String description) {
        ComplianceRule rule = new ComplianceRule();
        rule.setName(name);
        rule.setRuleType(type);
        rule.setThreshold(threshold);
        rule.setWindowMinutes(window);
        rule.setSeverity(severity);
        rule.setEnabled(enabled);
        rule.setDescription(description);
        return rule;
    }

    private void seedContestantsAndSessions() {
        contestantRepository.save(new Contestant(1L, "Ava Chen"));
        contestantRepository.save(new Contestant(2L, "Marcus Reed"));
        contestantRepository.save(new Contestant(3L, "Sofia Alvarez"));
        contestantRepository.save(new Contestant(4L, "Jordan Lee"));
        contestantRepository.save(new Contestant(5L, "Priya Nair"));

        Instant now = Instant.now();
        sessionRepository.save(new VotingSession(
                101L,
                "Session 101 — Finale live vote",
                now.minus(2, ChronoUnit.HOURS),
                now.plus(1, ChronoUnit.HOURS),
                0L));
        sessionRepository.save(new VotingSession(
                102L,
                "Session 102 — Semifinal recap",
                now.minus(1, ChronoUnit.DAYS),
                now.minus(20, ChronoUnit.HOURS),
                0L));
    }

    private long seedVotesSession101() {
        Instant now = Instant.now();
        List<Vote> votes = new ArrayList<>();
        // Spike IP for IP_VOTE_SPIKE (threshold 50 / 5 min)
        for (int i = 0; i < 60; i++) {
            votes.add(new Vote(101L, 3L, 1000L + i, "203.0.113.44",
                    now.minus(2, ChronoUnit.MINUTES).minus(i, ChronoUnit.SECONDS)));
        }
        // Medium IP for MAX_VOTES_PER_IP (threshold 20 / 60 min)
        for (int i = 0; i < 24; i++) {
            votes.add(new Vote(101L, 1L, 2000L + i, "198.51.100.12",
                    now.minus(30, ChronoUnit.MINUTES).minus(i, ChronoUnit.MINUTES)));
        }
        // Normal traffic
        for (int i = 0; i < 40; i++) {
            long contestant = 1 + (i % 3);
            votes.add(new Vote(101L, contestant, 3000L + i, "203.0.113." + (50 + (i % 20)),
                    now.minus(i, ChronoUnit.MINUTES)));
        }
        voteRepository.saveAll(votes);
        return votes.size();
    }

    private long seedVotesSession102() {
        Instant base = Instant.now().minus(22, ChronoUnit.HOURS);
        List<Vote> votes = new ArrayList<>();
        for (int i = 0; i < 50; i++) {
            votes.add(new Vote(102L, 4L, 4000L + i, "198.51.100." + (i % 10),
                    base.plus(i, ChronoUnit.MINUTES)));
        }
        for (int i = 0; i < 40; i++) {
            votes.add(new Vote(102L, 5L, 5000L + i, "198.51.100." + (10 + i % 8),
                    base.plus(i + 50, ChronoUnit.MINUTES)));
        }
        voteRepository.saveAll(votes);
        return votes.size();
    }

    private void seedAuditLogs() {
        audit( "admin@show.tv", "CREATE_RULE", "ComplianceRule", 1L,
                "Created rule \"IP vote spike\"", "10.0.0.8",
                Instant.parse("2026-08-01T10:00:00Z"));
        audit("admin@show.tv", "UPDATE_RULE", "ComplianceRule", 2L,
                "Updated threshold to 20", "10.0.0.8",
                Instant.parse("2026-08-02T14:20:00Z"));
        audit("viewer:8821", "CAST_VOTE", "Vote", 4401L,
                "Vote cast in session 101 for contestant 3", "203.0.113.44",
                Instant.now().minus(1, ChronoUnit.HOURS));
        audit("security@show.tv", "VERIFY_INTEGRITY", "VotingSession", 102L,
                "Integrity check failed sample", "10.0.0.21",
                Instant.now().minus(30, ChronoUnit.MINUTES));
        audit("admin@show.tv", "DISABLE_RULE", "ComplianceRule", 3L,
                "Disabled session throughput surge rule", "10.0.0.8",
                Instant.parse("2026-08-03T09:05:00Z"));
    }

    private void seedInvestigations() {
        Investigation inv1 = new Investigation();
        inv1.setTitle("IP spike — 203.0.113.44");
        inv1.setSessionId(101L);
        inv1.setAnomalyType("IP_VOTE_SPIKE");
        inv1.setIpAddress("203.0.113.44");
        inv1.setStatus(InvestigationStatus.REVIEWING);
        inv1.setSeverity(Severity.HIGH);
        inv1.setNotes("Reviewing vote burst during finale window.");
        inv1.setAssignedTo("security@show.tv");
        investigationRepository.save(inv1);

        Investigation inv2 = new Investigation();
        inv2.setTitle("Integrity mismatch session 102");
        inv2.setSessionId(102L);
        inv2.setAnomalyType("INTEGRITY");
        inv2.setStatus(InvestigationStatus.OPEN);
        inv2.setSeverity(Severity.MEDIUM);
        inv2.setNotes("Stored vs raw count delta under review.");
        inv2.setAssignedTo("admin@show.tv");
        investigationRepository.save(inv2);
    }

    private void audit(
            String actor,
            String action,
            String entityType,
            Long entityId,
            String details,
            String ip,
            Instant timestamp) {
        AuditLog log = new AuditLog();
        log.setActor(actor);
        log.setAction(action);
        log.setEntityType(entityType);
        log.setEntityId(entityId);
        log.setDetails(details);
        log.setIpAddress(ip);
        log.setTimestamp(timestamp);
        auditLogRepository.save(log);
    }
}
