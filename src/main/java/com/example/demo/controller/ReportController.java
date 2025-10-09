package com.example.demo.controller;

import com.example.demo.dto.ReportRequest;
import com.example.demo.dto.ReportResponse;
import com.example.demo.model.RepairRequest;
import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.ReportService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/requests")
public class ReportController {

    private final ReportService reportService;
    private final UserRepository userRepository;

    public ReportController(ReportService reportService, UserRepository userRepository) {
        this.reportService = reportService;
        this.userRepository = userRepository;
    }

    @PostMapping
    public RepairRequest createReport(@RequestBody RepairRequest report) {
        return reportService.createReport(report);
    }
    
    @GetMapping
    public List<RepairRequest> getReports() {
        return reportService.getAllReports();
    }

    // Update status using JSON body
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
}
