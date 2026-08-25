package com.app.votingsystem.repository;

import com.app.votingsystem.entity.Vote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;

public interface VoteRepository extends JpaRepository<Vote, Long> {

    long countBySessionId(Long sessionId);

    List<Vote> findBySessionId(Long sessionId);

    @Query("""
            select v.contestantId, count(v)
            from Vote v
            where v.sessionId = :sessionId
            group by v.contestantId
            """)
    List<Object[]> countByContestant(@Param("sessionId") Long sessionId);

    @Query("""
            select v.ipAddress, count(v)
            from Vote v
            where v.sessionId = :sessionId
              and v.castAt >= :from
              and v.castAt < :to
            group by v.ipAddress
            """)
    List<Object[]> countByIpInWindow(
            @Param("sessionId") Long sessionId,
            @Param("from") Instant from,
            @Param("to") Instant to);

    @Query("""
            select count(v)
            from Vote v
            where v.sessionId = :sessionId
              and v.castAt >= :from
              and v.castAt < :to
            """)
    long countInWindow(
            @Param("sessionId") Long sessionId,
            @Param("from") Instant from,
            @Param("to") Instant to);

    @Query("""
            select min(v.castAt), max(v.castAt)
            from Vote v
            where v.sessionId = :sessionId
            """)
    List<Object[]> castAtRange(@Param("sessionId") Long sessionId);
}
