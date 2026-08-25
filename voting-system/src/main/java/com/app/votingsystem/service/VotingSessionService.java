package com.app.votingsystem.service;

import com.app.votingsystem.dto.VotingSessionResponse;
import com.app.votingsystem.repository.VotingSessionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class VotingSessionService {

    private final VotingSessionRepository repository;

    public VotingSessionService(VotingSessionRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<VotingSessionResponse> list() {
        return repository.findAll().stream()
                .map(s -> new VotingSessionResponse(s.getId(), s.getLabel()))
                .toList();
    }
}
