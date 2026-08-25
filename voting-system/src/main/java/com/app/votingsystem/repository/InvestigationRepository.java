package com.app.votingsystem.repository;

import com.app.votingsystem.entity.Investigation;
import com.app.votingsystem.entity.InvestigationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InvestigationRepository extends JpaRepository<Investigation, Long> {
    List<Investigation> findByStatus(InvestigationStatus status);

    List<Investigation> findBySessionId(Long sessionId);
}
