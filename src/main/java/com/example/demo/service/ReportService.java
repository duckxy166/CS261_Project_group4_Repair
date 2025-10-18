package com.example.demo.service;

import com.example.demo.repository.ReportRepository;
import com.example.demo.model.RepairRequest;
import com.example.demo.model.User;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReportService {
    private final ReportRepository reportRepository;

    public ReportService(ReportRepository reportRepository) {
        this.reportRepository = reportRepository;
    }

    // ---------------- Create new report (always starts as Pending) ----------------
    public RepairRequest createReport(RepairRequest report) {
        report.setStatus("Pending");
        return reportRepository.save(report);
    }

    // ---------------- Get all reports ----------------
    public List<RepairRequest> getAllReports() {
        return reportRepository.findAll();
    }

    // ---------------- Update status + technician + priority ----------------
    public RepairRequest updateStatus(Long id, String status, User technician, String priority) {
        RepairRequest report = reportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Report not found"));

        // Update status and assign technician if needed
        report.updateStatus(status, technician);

        // ✅ Also update priority if provided
        if (priority != null && !priority.isEmpty()) {
            report.setPriority(priority);
        }

        // Save changes
        return reportRepository.save(report);
    }
}
