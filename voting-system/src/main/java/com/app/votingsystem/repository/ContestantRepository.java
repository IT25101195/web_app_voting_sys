package com.app.votingsystem.repository;

import com.app.votingsystem.entity.Contestant;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ContestantRepository extends JpaRepository<Contestant, Long> {
}
