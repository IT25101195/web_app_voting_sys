package com.app.votingsystem.service;

import com.app.votingsystem.dto.InvestigationRequest;
import com.app.votingsystem.dto.InvestigationResponse;
import com.app.votingsystem.entity.Investigation;
import com.app.votingsystem.entity.InvestigationStatus;
import com.app.votingsystem.exception.ResourceNotFoundException;
import com.app.votingsystem.repository.InvestigationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

@Service
public class InvestigationService {

    private final InvestigationRepository repository;

    public InvestigationService(InvestigationRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<InvestigationResponse> list(InvestigationStatus status, Long sessionId) {
        List<Investigation> items;
        if (status != null) {
            items = repository.findByStatus(status);
        } else if (sessionId != null) {
            items = repository.findBySessionId(sessionId);
        } else {
            items = repository.findAll();
        }
        return items.stream()
                .sorted(Comparator.comparing(Investigation::getUpdatedAt).reversed())
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public InvestigationResponse get(Long id) {
        return toResponse(find(id));
    }

    @Transactional
    public InvestigationResponse create(InvestigationRequest request) {
        Investigation investigation = new Investigation();
        apply(investigation, request);
        return toResponse(repository.save(investigation));
    }

    @Transactional
    public InvestigationResponse update(Long id, InvestigationRequest request) {
        Investigation investigation = find(id);
        apply(investigation, request);
        return toResponse(repository.save(investigation));
    }

    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Investigation " + id + " not found");
        }
        repository.deleteById(id);
    }

    private Investigation find(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Investigation " + id + " not found"));
    }

    private void apply(Investigation investigation, InvestigationRequest request) {
        investigation.setTitle(request.getTitle().trim());
        investigation.setSessionId(request.getSessionId());
        investigation.setAnomalyType(request.getAnomalyType());
        investigation.setIpAddress(request.getIpAddress());
        investigation.setStatus(request.getStatus());
        investigation.setSeverity(request.getSeverity());
        investigation.setNotes(request.getNotes() == null ? "" : request.getNotes());
        investigation.setAssignedTo(request.getAssignedTo());
    }

    private InvestigationResponse toResponse(Investigation investigation) {
        return new InvestigationResponse(
                investigation.getId(),
                investigation.getTitle(),
                investigation.getSessionId(),
                investigation.getAnomalyType(),
                investigation.getIpAddress(),
                investigation.getStatus(),
                investigation.getSeverity(),
                investigation.getNotes(),
                investigation.getAssignedTo(),
                investigation.getCreatedAt(),
                investigation.getUpdatedAt()
        );
    }
}
