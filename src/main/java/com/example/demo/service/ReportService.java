package com.example.demo.service;

import com.example.demo.repository.ReportRepository;
import com.example.demo.dto.ReportResponse;
import com.example.demo.model.*;
import org.springframework.stereotype.Service;

<<<<<<< HEAD
import java.time.LocalDateTime;
=======
import jakarta.transaction.Transactional;
import java.io.IOException;
>>>>>>> 349561c9e5eb5389d985ce8e8ec8599f018329ae
import java.util.List;

@Service
public class ReportService {

    private final ReportRepository reportRepository;
    private final FileStorageService fileStorageService; // ✅ final and injected

    // Constructor injection for both dependencies
    public ReportService(ReportRepository reportRepository, FileStorageService fileStorageService) {
        this.reportRepository = reportRepository;
        this.fileStorageService = fileStorageService;
    }

    // ---------------- Create new report (always starts as Pending) ----------------
    public RepairRequest createReport(RepairRequest report) {
        report.setStatus("รอดำเนินการ");
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

        if (priority != null && !priority.isEmpty()) {
            report.setPriority(priority);
        }

        return reportRepository.save(report);
    }

<<<<<<< HEAD
    public RepairRequest markAsCompleted(Long id) {
        RepairRequest report = reportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Report not found"));
        report.setStatus("Completed");
        report.setUpdatedAt(LocalDateTime.now());
        return reportRepository.save(report);
=======
    // ---------------- Fetch user reports except ซ่อมเสร็จ ----------------
    public List<ReportResponse> getUserTrackReports(User user) {
        return reportRepository.findByReporter(user).stream()
                .filter(r -> !"ซ่อมเสร็จ".equals(r.getStatus()))
                .map(r -> new ReportResponse(
                        r.getId(),
                        r.getStatus(),
                        r.getTechnician(),
                        r.getTitle(),
                        r.getLocation(),
                        r.getDescription(),
                        r.getReporter().getFullName(),
                        r.getCreatedAt()
                ))
                .toList();
>>>>>>> 349561c9e5eb5389d985ce8e8ec8599f018329ae
    }

    // ---------------- Delete report ----------------
    @Transactional
    public void deleteReport(Long id, User user) {
        RepairRequest report = reportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Report not found"));

        if (!report.getReporter().getId().equals(user.getId())) {
            throw new RuntimeException("Cannot delete others' reports");
        }

        //  Delete attachments 
        List<Attachment> attachments = fileStorageService.listByRequest(id);
        for (Attachment att : attachments) {
            try {
                fileStorageService.delete(att.getId());
            } catch (IOException e) {
                throw new RuntimeException("Failed to delete attachment: " + att.getOriginalFilename(), e);
            }
        }

        // Delete the report
        reportRepository.delete(report);
    }

    // ---------------- Fetch single report by ID ----------------
    public ReportResponse getReportDetail(Long id, User currentUser) {
        RepairRequest report = reportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Report not found"));

        if (!report.getReporter().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Cannot access others' reports");
        }

        return new ReportResponse(
                report.getId(),
                report.getStatus(),
                report.getTechnician(),
                report.getTitle(),
                report.getLocation(),
                report.getDescription(),
                report.getReporter().getFullName(),
                report.getCreatedAt()
        );
    }
}
