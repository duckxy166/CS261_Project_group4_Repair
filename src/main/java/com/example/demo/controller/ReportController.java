package com.example.demo.controller;

import com.example.demo.dto.ReportRequest;
import com.example.demo.dto.ReportResponse;
import com.example.demo.dto.ReportUpdateRequest;
import com.example.demo.dto.RequestFormDTO;
import com.example.demo.model.RepairRequest;
import com.example.demo.model.User;
import com.example.demo.repository.ReportRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.FileStorageService;
import com.example.demo.service.ReportService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import jakarta.servlet.http.HttpSession;

import org.springframework.http.MediaType;
import java.util.List;

@RestController
@RequestMapping("/api/requests")
public class ReportController {

    private final ReportRepository reportRepository;
    private final ReportService reportService;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;
    
    public ReportController(
            ReportRepository reportRepository,
            ReportService reportService,
            UserRepository userRepository,
            FileStorageService fileStorageService
    ) {
        this.reportRepository = reportRepository;
        this.reportService = reportService;
        this.userRepository = userRepository;
        this.fileStorageService = fileStorageService;
    }
    // ---------------- Create report ----------------
    @PostMapping
    public RepairRequest createReport(@RequestBody RequestFormDTO dto, HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            throw new RuntimeException("Not logged in");
        }
        
        RepairRequest report = new RepairRequest();
        report.setTitle(dto.getTitle());
        report.setDescription(dto.getDescription());
        report.setPriority(dto.getPriority());
        report.setLocation(dto.getLocation());
        report.setReporter(user);
        report.setCategory(dto.getCategory());
        report.setLocationDetail(dto.getLocationDetail());

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
            return List.of();
        }
        return reportRepository.findByReporter(user);
    }

    @GetMapping("/history")
    public List<RepairRequest> getUserHistory(HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            return List.of();
        }
        return reportService.getUserHistoryReports(user);
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

    // ---------------- Get report detail ----------------
    @GetMapping("/{id}")
    public ReportResponse getReportDetail(@PathVariable Long id, HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            throw new RuntimeException("Not logged in");
        }
        return reportService.getReportDetail(id, user);
    }

    // ---------------- Update status by technician ----------------
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
                updated.getLocationDetail(),
                updated.getDescription(),
                updated.getReporter().getFullName(),
                updated.getCreatedAt(),
                updated.getCategory()
        );

        return ResponseEntity.ok(response);
    }

    // ---------------- Update (title, location, description, attachments) ----------------
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<RepairRequest> updateRequest(
            @PathVariable Long id,
            @RequestParam("title") String title,
            @RequestParam("location") String location,
            @RequestParam("description") String description,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "locationDetail", required = false) String locationDetail,
            @RequestParam("existingAttachments") String existingAttachmentsJson,
            @RequestParam(value = "newAttachments", required = false) List<MultipartFile> newAttachments,
            @RequestParam(value = "removedAttachments", required = false) String removedAttachmentsJson
            
    ) {
    	try {
        // Optional: parse existingAttachments if needed (or just pass as JSON string if your service ignores it)
        RepairRequest updated = reportService.updateRequest(
                id,
                title,
                location,
                description,
                category,
                locationDetail,
                existingAttachmentsJson,
                newAttachments,
                removedAttachmentsJson
        );
        updated.setCategory(category);
        return ResponseEntity.ok(updated);

	    }catch (Exception e) {
	        e.printStackTrace();
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
	    }
    }
}
