package com.app.votingsystem.repository;

import com.app.votingsystem.entity.ComplianceRule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ComplianceRuleRepository extends JpaRepository<ComplianceRule, Long> {
    List<ComplianceRule> findByEnabled(Boolean enabled);
}
