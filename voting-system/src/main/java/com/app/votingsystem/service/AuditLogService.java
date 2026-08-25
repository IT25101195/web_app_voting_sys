package com.app.votingsystem.service;

import com.app.votingsystem.dto.AuditLogResponse;
import com.app.votingsystem.dto.PageResponse;
import com.app.votingsystem.entity.AuditLog;
import com.app.votingsystem.exception.ResourceNotFoundException;
import com.app.votingsystem.repository.AuditLogRepository;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
public class AuditLogService {

    private final AuditLogRepository repository;

    public AuditLogService(AuditLogRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public AuditLog log(String actor, String action, String entityType, Long entityId, String details, String ipAddress) {
        AuditLog entry = new AuditLog();
        entry.setActor(actor);
        entry.setAction(action);
        entry.setEntityType(entityType);
        entry.setEntityId(entityId);
        entry.setDetails(details);
        entry.setIpAddress(ipAddress);
        entry.setTimestamp(Instant.now());
        return repository.save(entry);
    }

    @Transactional(readOnly = true)
    public AuditLogResponse getById(Long id) {
        return toResponse(repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Audit log " + id + " not found")));
    }

    @Transactional(readOnly = true)
    public List<AuditLogResponse> getByEntity(String entityType, Long entityId) {
        return repository.findByEntityTypeIgnoreCaseAndEntityIdOrderByTimestampDesc(entityType, entityId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public PageResponse<AuditLogResponse> search(
            String actor,
            String action,
            String entityType,
            Instant from,
            Instant to,
            int page,
            int size) {
        Specification<AuditLog> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (actor != null && !actor.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("actor")), "%" + actor.toLowerCase() + "%"));
            }
            if (action != null && !action.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("action")), "%" + action.toLowerCase() + "%"));
            }
            if (entityType != null && !entityType.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("entityType")), "%" + entityType.toLowerCase() + "%"));
            }
            if (from != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("timestamp"), from));
            }
            if (to != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("timestamp"), to));
            }
            return cb.and(predicates.toArray(Predicate[]::new));
        };

        Page<AuditLog> result = repository.findAll(
                spec,
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "timestamp")));

        return new PageResponse<>(
                result.getContent().stream().map(this::toResponse).toList(),
                result.getNumber(),
                result.getSize(),
                result.getTotalElements(),
                result.getTotalPages()
        );
    }

    @Transactional
    public long purge(Instant before) {
        return repository.deleteByTimestampBefore(before);
    }

    @Transactional(readOnly = true)
    public byte[] export(
            String actor,
            String action,
            String entityType,
            Instant from,
            Instant to,
            String format) {
        PageResponse<AuditLogResponse> page = search(actor, action, entityType, from, to, 0, 10_000);
        if ("csv".equalsIgnoreCase(format)) {
            StringBuilder sb = new StringBuilder();
            sb.append("id,actor,action,entityType,entityId,details,ipAddress,timestamp\n");
            for (AuditLogResponse log : page.content()) {
                sb.append(log.id()).append(',')
                        .append(csv(log.actor())).append(',')
                        .append(log.action()).append(',')
                        .append(log.entityType()).append(',')
                        .append(log.entityId()).append(',')
                        .append(csv(log.details())).append(',')
                        .append(log.ipAddress()).append(',')
                        .append(log.timestamp())
                        .append('\n');
            }
            return sb.toString().getBytes(StandardCharsets.UTF_8);
        }

        StringBuilder json = new StringBuilder();
        json.append("[\n");
        List<AuditLogResponse> logs = page.content();
        for (int i = 0; i < logs.size(); i++) {
            AuditLogResponse log = logs.get(i);
            json.append("  {")
                    .append("\"id\":").append(log.id()).append(',')
                    .append("\"actor\":").append(jsonString(log.actor())).append(',')
                    .append("\"action\":").append(jsonString(log.action())).append(',')
                    .append("\"entityType\":").append(jsonString(log.entityType())).append(',')
                    .append("\"entityId\":").append(log.entityId()).append(',')
                    .append("\"details\":").append(jsonString(log.details())).append(',')
                    .append("\"ipAddress\":").append(jsonString(log.ipAddress())).append(',')
                    .append("\"timestamp\":").append(jsonString(String.valueOf(log.timestamp())))
                    .append('}');
            if (i < logs.size() - 1) {
                json.append(',');
            }
            json.append('\n');
        }
        json.append("]\n");
        return json.toString().getBytes(StandardCharsets.UTF_8);
    }

    private static String csv(String value) {
        if (value == null) {
            return "\"\"";
        }
        return "\"" + value.replace("\"", "\"\"") + "\"";
    }

    private static String jsonString(String value) {
        if (value == null) {
            return "null";
        }
        return "\"" + value
                .replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                + "\"";
    }

    private AuditLogResponse toResponse(AuditLog log) {
        return new AuditLogResponse(
                log.getId(),
                log.getActor(),
                log.getAction(),
                log.getEntityType(),
                log.getEntityId(),
                log.getDetails(),
                log.getIpAddress(),
                log.getTimestamp()
        );
    }
}
