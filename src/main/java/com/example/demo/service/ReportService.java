package com.example.demo.service;

import com.example.demo.repository.ReportRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.example.demo.dto.ReportResponse;
import com.example.demo.model.*;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import jakarta.transaction.Transactional;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class ReportService {

    private final ReportRepository reportRepository;
    private final FileStorageService fileStorageService; 
    private final ObjectMapper mapper = new ObjectMapper();

    // Constructor
    public ReportService(ReportRepository reportRepository, FileStorageService fileStorageService) {
        this.reportRepository = reportRepository;
        this.fileStorageService = fileStorageService;
    }

    // ---------------- Create new report ----------------
    public RepairRequest createReport(RepairRequest report) {
        report.setStatus("รอดำเนินการ");
        return reportRepository.save(report);
    }

    // ---------------- Get all reports ----------------
    public List<RepairRequest> getAllReports() {
        return reportRepository.findAll();
    }

    // ---------------- Update status + technician + priority ----------------
    @Transactional
    public RepairRequest updateStatus(Long id, String status, User technician, String priority) {
        RepairRequest report = reportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Report not found"));

        report.updateStatus(status, technician);

        if (priority != null && !priority.isEmpty()) {
            report.setPriority(priority);
        }

        return reportRepository.save(report);
    }


    // ---------------- Mark report as completed ----------------
    public RepairRequest markAsCompleted(Long id) {
        RepairRequest report = reportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Report not found"));
        report.setStatus("Completed");
        report.setUpdatedAt(LocalDateTime.now());
        return reportRepository.save(report);
    }

    // ---------------- Fetch user reports except ซ่อมเสร็จ ----------------
public List<ReportResponse> getUserTrackReports(User user) {
        return reportRepository.findByReporter(user).stream()
                .filter(r -> !("ซ่อมเสร็จ".equals(r.getStatus()) 
                            || "เสร็จ".equals(r.getStatus()) 
                            || "สำเร็จ".equals(r.getStatus())
                            || "ยกเลิก".equals(r.getStatus())))
                .map(r -> new ReportResponse(
                        r.getId(),
                        r.getStatus(),
                        r.getTechnician(),
                        r.getTitle(),
                        r.getLocation(),
                        r.getLocationDetail(),
                        r.getDescription(),
                        r.getReporter().getFullName(),
                        r.getCreatedAt(),
                        r.getCategory()
                ))
                .toList();
    }
// ---------------- Fetch user COMPLETED reports for History ----------------
public List<RepairRequest> getUserHistoryReports(User user) {
    return reportRepository.findByReporter(user).stream()
            .filter(r -> ("ซ่อมเสร็จ".equals(r.getStatus())
                        || "เสร็จ".equals(r.getStatus()) 
                        || "สำเร็จ".equals(r.getStatus())
                        || "ยกเลิก".equals(r.getStatus())
                        || "ยังไม่ได้คะแนน".equals(r.getStatus())))
            .toList();
}


    // ---------------- Delete report ----------------
    @Transactional
    public void deleteReport(Long id, User user) {
        RepairRequest report = reportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Report not found"));

        if (!report.getReporter().getId().equals(user.getId())) {
            throw new RuntimeException("Cannot delete others' reports");
        }

        List<Attachment> attachments = fileStorageService.listByRequest(id);
        for (Attachment att : attachments) {
            try {
                fileStorageService.delete(att.getId());
            } catch (IOException e) {
                throw new RuntimeException("Failed to delete attachment: " + att.getOriginalFilename(), e);
            }
        }

        reportRepository.delete(report);
    }

    // ---------------- Fetch single report by ID ----------------
    public ReportResponse getReportDetail(Long id, User currentUser) {
        RepairRequest report = reportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Report not found"));

        //if (!report.getReporter().getId().equals(currentUser.getId())) {
        //    throw new RuntimeException("Cannot access others' reports");
        //}

        return new ReportResponse(
                report.getId(),
                report.getStatus(),
                report.getTechnician(),
                report.getTitle(),
                report.getLocation(),
                report.getLocationDetail(),
                report.getDescription(),
                report.getReporter().getFullName(),
                report.getCreatedAt(),
                report.getCategory()
        );
    }
    
    //for edit
    public RepairRequest updateRequest(
            Long id,
            String title,
            String location,
            String description,
            String category,
            String locationDetail,
            String existingAttachmentsJson,
            List<MultipartFile> newAttachments,
            String removedAttachmentsJson
            
    ) {
        RepairRequest report = reportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Report not found"));
        report.setTitle(title);
        report.setLocation(location);
        report.setDescription(description);
        report.setLocationDetail(locationDetail);
        if (category != null && !category.isBlank()) {
            report.setCategory(category);
        }
        ObjectMapper mapper = new ObjectMapper();

        // 1️⃣ Remove deleted attachments
        if (removedAttachmentsJson != null && !removedAttachmentsJson.isBlank()) {
            try {
                List<Long> removedIds = mapper.readValue(
                        removedAttachmentsJson, new TypeReference<List<Long>>() {});
                for (Long removeId : removedIds) {
                    try {
                        fileStorageService.delete(removeId);
                    } catch (IOException e) {
                        // Handle or log failed deletion but continue
                        System.err.println("Failed to delete attachment " + removeId + ": " + e.getMessage());
                    }
                }
            } catch (Exception e) {
                throw new RuntimeException("Failed to parse removed attachments list", e);
            }
        }

        // 2️⃣ Update report info
        report.setTitle(title);
        report.setLocation(location);
        report.setDescription(description);

        // 3️⃣ Add new attachments
        if (newAttachments != null) {
            for (MultipartFile f : newAttachments) {
                fileStorageService.saveAttachment(f, report);
            }
        }

        return reportRepository.save(report);
    }

}
