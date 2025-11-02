package com.example.demo.controller;

import com.example.demo.dto.RepairReportRequest;
import com.example.demo.dto.RepairReportResponse;
import com.example.demo.model.RepairReport;
import com.example.demo.service.RepairReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/repair-reports")
public class RepairReportController {

    @Autowired
    private RepairReportService repairReportService;

    @PostMapping
    public ResponseEntity<RepairReportResponse> createReport(@RequestBody RepairReportRequest req) {
        RepairReport report = repairReportService.createRepairReport(req);
        RepairReportResponse response = new RepairReportResponse(
                report.getId(),
                report.getFullName(),
                report.getDetail(),
                report.getUpdStatus(),
                report.getRepairRequest() != null ? report.getRepairRequest().getId() : null
        );

        return ResponseEntity.ok(response);
    }
}