package com.app.votingsystem.repository;

import com.app.votingsystem.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.time.Instant;
import java.util.List;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long>, JpaSpecificationExecutor<AuditLog> {
    List<AuditLog> findByEntityTypeIgnoreCaseAndEntityIdOrderByTimestampDesc(String entityType, Long entityId);

    long deleteByTimestampBefore(Instant before);

    Page<AuditLog> findByActorContainingIgnoreCaseAndActionContainingIgnoreCaseAndEntityTypeContainingIgnoreCase(
            String actor, String action, String entityType, Pageable pageable);
}
