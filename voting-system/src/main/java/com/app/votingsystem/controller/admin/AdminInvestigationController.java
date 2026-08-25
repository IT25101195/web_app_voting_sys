package com.app.votingsystem.controller.admin;

import com.app.votingsystem.dto.InvestigationRequest;
import com.app.votingsystem.dto.InvestigationResponse;
import com.app.votingsystem.entity.InvestigationStatus;
import com.app.votingsystem.service.InvestigationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/admin/compliance/investigations")
public class AdminInvestigationController {

    private final InvestigationService investigationService;

    public AdminInvestigationController(InvestigationService investigationService) {
        this.investigationService = investigationService;
    }

    @GetMapping
    public List<InvestigationResponse> list(
            @RequestParam(required = false) InvestigationStatus status,
            @RequestParam(required = false) Long sessionId) {
        return investigationService.list(status, sessionId);
    }

    @GetMapping("/{id}")
    public InvestigationResponse get(@PathVariable Long id) {
        return investigationService.get(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public InvestigationResponse create(@Valid @RequestBody InvestigationRequest request) {
        return investigationService.create(request);
    }

    @PutMapping("/{id}")
    public InvestigationResponse update(
            @PathVariable Long id,
            @Valid @RequestBody InvestigationRequest request) {
        return investigationService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        investigationService.delete(id);
    }
}
