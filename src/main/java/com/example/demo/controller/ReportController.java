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
import java.util.Optional;

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

    // ---------------- Cancel report by User ----------------
    @PostMapping("/{id}/cancel")
    public ResponseEntity<?> cancelReport(@PathVariable Long id, HttpSession session) {
        // 1. ตรวจสอบ User ใน Session
        User user = (User) session.getAttribute("user");
        if (user == null) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Not logged in");
        }

        try {
            // 2. เรียกใช้ Service เพื่อยกเลิก
            reportService.cancelReport(id, user);
            
            // 3. ส่งคำตอบสำเร็จ
            return ResponseEntity.ok("Report " + id + " cancelled successfully.");

        } catch (RuntimeException e) {
            // 4. จัดการ Error (เช่น "Report not found" หรือ "Cannot cancel")
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        }
    }
    

    // ---------------- Get report detail ----------------
   @GetMapping("/{id}")
public ResponseEntity<?> getReportDetail(@PathVariable Long id, HttpSession session) {
    User user = (User) session.getAttribute("user");
    if (user == null) {
         return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body("Not logged in");
    }

    // 1. ดึง Report ต้นทางจาก ID
    Optional<RepairRequest> optReport = reportRepository.findById(id);
    if (optReport.isEmpty()) {
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body("Report not found");
    }

    RepairRequest report = optReport.get();

    // 2. (Optional) ตรวจสอบสิทธิ์ว่า user นี้ดู report นี้ได้หรือไม่
    // (ข้ามไปก่อนเพื่อความง่าย แต่ service เดิมของคุณอาจจะทำอยู่)
    
    // 3. สร้าง Response ที่มีข้อมูลครบถ้วน
    ReportResponse response = new ReportResponse(
            report.getId(),
            report.getStatus(),
            report.getTechnician(),
            report.getTitle(),
            report.getLocation(),
            report.getLocationDetail(),
            report.getDescription(),
            // เพิ่มการตรวจสอบ null ให้ reporter
            report.getReporter() != null ? report.getReporter().getFullName() : "N/A", 
            report.getCreatedAt(),
            report.getCategory(),
            report.getCause(),     // <-- ข้อมูลมาแล้ว
            report.getMethod(),    // <-- ข้อมูลมาแล้ว
            report.getParts()      // <-- ข้อมูลมาแล้ว
    );

    // 4. ส่ง Response กลับไป
    return ResponseEntity.ok(response);
}

    // ---------------- Update status by technician ----------------
    @PostMapping("/{id}/update-status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @RequestBody ReportUpdateRequest req,
            HttpSession session) {

        // 1️⃣ Check if session has a logged-in user
        User currentUser = (User) session.getAttribute("user");
        
        if (currentUser == null) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("No logged-in user in session");
        }
        

        // 2️⃣ Check if user has fullName
        if (currentUser.getFullName() == null || currentUser.getFullName().isBlank()) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("Current user does not have a full name");
        }

        // 3️⃣ Fetch the report
        Optional<RepairRequest> optReport = reportRepository.findById(id);
        if (optReport.isEmpty()) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Report not found");
        }

        RepairRequest report = optReport.get();

        // 4️⃣ Update status only if provided
        if (req.getStatus() != null && !req.getStatus().isBlank()) {
            report.setStatus(req.getStatus());
        }
        
        // 5️⃣ Update technician if 'self'
        if (req.getTechnician() == null || "self".equals(req.getTechnician())) {
            report.setTechnician(currentUser.getFullName());
        } else {
            report.setTechnician(req.getTechnician());
        }
        
        //report.setTechnician("");

        // 6️⃣ Save to DB
        reportRepository.save(report);

        // 7️⃣ Return response
        ReportResponse response = new ReportResponse(
                report.getId(),
                report.getStatus(),
                report.getTechnician(),
                report.getTitle(),
                report.getLocation(),
                report.getLocationDetail(),
                report.getDescription(),
                report.getReporter().getFullName(),
                report.getCreatedAt(),
                report.getCategory(),
                report.getCause(),
                report.getMethod(),
                report.getParts()
        );

        
        System.out.println("==== DEBUG ====");
        System.out.println("Technician from request: " + req.getTechnician());
        System.out.println("Current user full name: " + currentUser.getFullName());
        System.out.println("Technician to save: " + report.getTechnician());
        System.out.println("================");
        
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
    
    @PostMapping("/{id}/submit-report")
    public ResponseEntity<?> submitRepairReport(
            @PathVariable Long id,
            @RequestParam("cause") String cause,
            @RequestParam("method") String method,
            @RequestParam("parts") String parts,
            HttpSession session
    ) {
        User technician = (User) session.getAttribute("user");
        if (technician == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not logged in");
        }

        // ดึงงานซ่อม
        Optional<RepairRequest> opt = reportRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Repair request not found");
        }

        RepairRequest req = opt.get();

        // บันทึกข้อมูลรายงานตามที่ช่างกรอก
        req.setCause(cause);
        req.setMethod(method);
        req.setParts(parts);

        // อัปเดตคนซ่อม (กันลืม)
        req.setTechnician(technician.getFullName());

        // อัปเดตสถานะหลังซ่อม
        req.setStatus("กำลังตรวจสอบงานซ่อม");

        reportRepository.save(req);

        return ResponseEntity.ok("Report submitted successfully");
    }
}
