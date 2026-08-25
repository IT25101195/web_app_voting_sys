package com.app.votingsystem.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "voting_sessions")
public class VotingSession {

    @Id
    private Long id;

    @Column(nullable = false)
    private String label;

    private Instant startTime;

    private Instant endTime;

    /** Denormalized total used for integrity reconciliation against raw votes. */
    @Column(nullable = false)
    private Long storedVoteCount = 0L;

    public VotingSession() {
    }

    public VotingSession(Long id, String label, Instant startTime, Instant endTime, Long storedVoteCount) {
        this.id = id;
        this.label = label;
        this.startTime = startTime;
        this.endTime = endTime;
        this.storedVoteCount = storedVoteCount;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public Instant getStartTime() {
        return startTime;
    }

    public void setStartTime(Instant startTime) {
        this.startTime = startTime;
    }

    public Instant getEndTime() {
        return endTime;
    }

    public void setEndTime(Instant endTime) {
        this.endTime = endTime;
    }

    public Long getStoredVoteCount() {
        return storedVoteCount;
    }

    public void setStoredVoteCount(Long storedVoteCount) {
        this.storedVoteCount = storedVoteCount;
    }
}
