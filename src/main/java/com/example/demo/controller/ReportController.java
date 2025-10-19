package com.example.demo.controller;

import com.example.demo.dto.ReportRequest;
import com.example.demo.dto.ReportResponse;
import com.example.demo.dto.ReportUpdateRequest;
import com.example.demo.dto.RequestFormDTO;
import com.example.demo.model.RepairRequest;
import com.example.demo.model.User;
import com.example.demo.repository.ReportRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.ReportService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
    public RepairRequest createReport(@RequestBody RequestFormDTO dto, HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            throw new RuntimeException("Not logged in");
        }

        // Map DTO -> Entity
        RepairRequest report = new RepairRequest();
        report.setTitle(dto.getTitle());
        report.setDescription(dto.getDescription());
        report.setPriority(dto.getPriority());
        report.setLocation(dto.getLocation()); // 🔹 now supported
        report.setReporter(user); // set current user

        return reportService.createReport(report);
    }

    // ---------------- All reports ----------------
    @GetMapping
    public List<RepairRequest> getReports() {
        return reportService.getAllReports();
    }

    // ---------------- Fetch user reports for history.js ----------------
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

        // include request.getPriority()
        RepairRequest updated = reportService.updateStatus(
                request.getId(),
                request.getStatus(),
                technician,
                request.getPriority()
        );

        return new ReportResponse(
                updated.getId(),
                updated.getStatus(),
                updated.getTechnician()
        );
    }
    
    //---------------- Fetch user track reports ----------------
    @GetMapping("/user-trackreports")
    public List<ReportResponse> getTrackReports(HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null) return List.of();

        // delegate to service
        return reportService.getUserTrackReports(user);
    }

    // ---------------- Delete report ----------------
    @DeleteMapping("/{id}")
    public void deleteReport(@PathVariable Long id, HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            throw new RuntimeException("Not logged in");
        }

        reportService.deleteReport(id, user);
    }

    //getrequestbyId
    @GetMapping("/{id}")
    public ReportResponse getReportDetail(@PathVariable Long id, HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            throw new RuntimeException("Not logged in");
        }
        return reportService.getReportDetail(id, user);
    }
    //update Status by Technician
    @PostMapping("/{id}/update-status")
    public ResponseEntity<ReportResponse> updateStatus(
            @PathVariable Long id,
            @RequestBody ReportUpdateRequest req,
            HttpSession session) {

        User currentUser = (User) session.getAttribute("user");
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        User technician = null;
        if ("self".equals(req.getTechnician())) {
            technician = currentUser;
        }

        RepairRequest updated = reportService.updateStatus(id, req.getStatus(), technician, req.getPriority());
        ReportResponse response = new ReportResponse(
                updated.getId(),
                updated.getStatus(),
                updated.getTechnician(),
                updated.getTitle(),
                updated.getLocation(),
                updated.getDescription(),
                updated.getReporter().getFullName(),
                updated.getCreatedAt()
        );

        return ResponseEntity.ok(response);
    }

}
