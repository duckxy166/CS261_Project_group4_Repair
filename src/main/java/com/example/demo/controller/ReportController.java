package com.example.demo.controller;

import com.example.demo.dto.ReportRequest;
import com.example.demo.dto.ReportResponse;
import com.example.demo.model.RepairRequest;
import com.example.demo.model.User;
import com.example.demo.repository.ReportRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.ReportService;

import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpSession;

import java.util.List;

@RestController
@RequestMapping("/api/requests")
public class ReportController {

    private final ReportRepository reportRepository;
    private final ReportService reportService;
    private final UserRepository userRepository;

    public ReportController(ReportRepository reportRepository, ReportService reportService, UserRepository userRepository) {
        this.reportRepository = reportRepository;
        this.reportService = reportService;
        this.userRepository = userRepository;
    }

    // ---------------- Create report ----------------
    @PostMapping
    public RepairRequest createReport(@RequestBody RepairRequest report, HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            throw new RuntimeException("Not logged in");
        }

        report.setReporter(user);
        return reportService.createReport(report);
    }

    // ---------------- All reports ----------------
    @GetMapping
    public List<RepairRequest> getReports() {
        return reportService.getAllReports();
    }

    // ---------------- Fetch user reports for frontend ----------------
    @GetMapping("/user-reports")
    public List<RepairRequest> getUserReports(HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            return List.of(); // empty if not logged in
        }
        return reportRepository.findByReporter(user);
    }

    // ---------------- Update report status ----------------
    @PostMapping("/update-status")
    public ReportResponse updateStatus(@RequestBody ReportRequest request) {
        User technician = null;
        if (request.getTechnicianId() != null) {
            technician = userRepository.findById(request.getTechnicianId())
                    .orElseThrow(() -> new RuntimeException("Technician not found"));
        }

        RepairRequest updated = reportService.updateStatus(
                request.getId(),
                request.getStatus(),
                technician
        );

        return new ReportResponse(
                updated.getId(),
                updated.getStatus(),
                updated.getTechnician()
        );
    }
    @DeleteMapping("/{id}")
    public void deleteReport(@PathVariable Long id, HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            throw new RuntimeException("Not logged in");
        }

        RepairRequest report = reportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Report not found"));

        // Optional: only allow reporter to delete their own report
        if (!report.getReporter().getId().equals(user.getId())) {
            throw new RuntimeException("Cannot delete others' reports");
        }

        reportRepository.delete(report);
    }
}
