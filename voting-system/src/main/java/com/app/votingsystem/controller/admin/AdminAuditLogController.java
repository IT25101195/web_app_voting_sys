package com.app.votingsystem.controller.admin;

import com.app.votingsystem.dto.AuditLogResponse;
import com.app.votingsystem.dto.PageResponse;
import com.app.votingsystem.service.AuditLogService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/admin/audit-logs")
public class AdminAuditLogController {

    private final AuditLogService auditLogService;

    public AdminAuditLogController(AuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    @GetMapping
    public PageResponse<AuditLogResponse> list(
            @RequestParam(required = false) String actor,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String entityType,
            @RequestParam(required = false) Instant from,
            @RequestParam(required = false) Instant to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return auditLogService.search(actor, action, entityType, from, to, page, size);
    }

    @GetMapping("/{id}")
    public AuditLogResponse get(@PathVariable Long id) {
        return auditLogService.getById(id);
    }

    @GetMapping("/entity/{type}/{entityId}")
    public List<AuditLogResponse> byEntity(
            @PathVariable String type,
            @PathVariable Long entityId) {
        return auditLogService.getByEntity(type, entityId);
    }

    @DeleteMapping("/purge")
    public Long purge(@RequestParam Instant before) {
        return auditLogService.purge(before);
    }

    @GetMapping("/export")
    public ResponseEntity<byte[]> export(
            @RequestParam(required = false) String actor,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String entityType,
            @RequestParam(required = false) Instant from,
            @RequestParam(required = false) Instant to,
            @RequestParam(defaultValue = "json") String format) {
        byte[] body = auditLogService.export(actor, action, entityType, from, to, format);
        boolean csv = "csv".equalsIgnoreCase(format);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"audit-logs." + (csv ? "csv" : "json") + "\"")
                .contentType(csv
                        ? MediaType.parseMediaType("text/csv")
                        : MediaType.APPLICATION_JSON)
                .body(body);
    }
}
