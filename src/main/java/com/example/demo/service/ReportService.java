package com.example.demo.service;

import com.example.demo.repository.ReportRepository;
import com.example.demo.model.RepairRequest;
import com.example.demo.model.User;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ReportService {
    private final ReportRepository reportRepository;

    public ReportService(ReportRepository reportRepository) {
        this.reportRepository = reportRepository;
    }

    // Create new report -> always starts as Pending
    public RepairRequest createReport(RepairRequest report) {
        report.setStatus("Pending");
        return reportRepository.save(report);
    }

    // Get all reports
    public List<RepairRequest> getAllReports() {
        return reportRepository.findAll();
    }

    public RepairRequest updateStatus(Long id, String status, User technician) {
        RepairRequest report = reportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Report not found"));
        report.updateStatus(status, technician);
        return reportRepository.save(report);
    }

    public RepairRequest markAsCompleted(Long id) {
        RepairRequest report = reportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Report not found"));
        report.setStatus("Completed");
        report.setUpdatedAt(LocalDateTime.now());
        return reportRepository.save(report);
    }

}
