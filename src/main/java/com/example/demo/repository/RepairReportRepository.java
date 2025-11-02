package com.example.demo.repository;

import com.example.demo.model.RepairReport;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RepairReportRepository extends JpaRepository<RepairReport, Long> {
}
