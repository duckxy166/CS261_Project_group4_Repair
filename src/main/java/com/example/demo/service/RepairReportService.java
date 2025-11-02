package com.example.demo.service;

import com.example.demo.dto.RepairReportRequest;
import com.example.demo.model.RepairReport;
import com.example.demo.model.RepairRequest;
import com.example.demo.repository.RepairReportRepository;
import com.example.demo.repository.ReportRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class RepairReportService {

    @Autowired
    private RepairReportRepository repairReportRepository;

    @Autowired
    private ReportRepository repairRequestRepository;

    public RepairReport createRepairReport(RepairReportRequest req) {
        RepairReport report = new RepairReport();
        report.setFullName(req.getFullName());
        report.setDetail(req.getDetail());
        report.setUpdStatus(req.getUpdStatus());

        if (req.getRepairRequestId() != null) {
            RepairRequest repairRequest = repairRequestRepository.findById(req.getRepairRequestId()).orElse(null);
            report.setRepairRequest(repairRequest);
        }

        return repairReportRepository.save(report);
    }
}