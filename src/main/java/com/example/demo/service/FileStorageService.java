package com.example.demo.service;

import com.example.demo.model.Attachment;
import com.example.demo.model.RepairRequest;
import com.example.demo.repository.AttachmentRepository;
import com.example.demo.repository.ReportRepository;

//import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
//@RequiredArgsConstructor
public class FileStorageService {

    private final AttachmentRepository attachmentRepo;
    private final ReportRepository repairRepo;
    
    // Default root folder if not configured
    private final Path rootLocation = Paths.get("uploads");
    
    public FileStorageService(
    		AttachmentRepository attachmentRepo,
    		ReportRepository repairRepo
    ) {
        this.attachmentRepo = attachmentRepo;
        this.repairRepo = repairRepo;
    }
    @Value("${storage.upload-dir:uploads}") // fallback to "uploads"
    private String uploadDir;
    
    
    // 🔹 List all attachments by RepairRequest ID
    public List<Attachment> listByRequest(Long requestId) {
        return attachmentRepo.findByRepairRequestId(requestId);
    }

    // 🔹 Store uploaded file
    public Attachment store(Long requestId, MultipartFile file, String description) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("❌ Empty file");
        }

        // Find the RepairRequest record
        RepairRequest req = repairRepo.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("RepairRequest not found: " + requestId));

        // Prepare directory structure: /uploads/YYYY/MM/
        Path root = Paths.get(uploadDir).toAbsolutePath().normalize();
        Files.createDirectories(root);

        LocalDate today = LocalDate.now();
        Path monthDir = root.resolve(today.getYear() + "/" + String.format("%02d", today.getMonthValue()));
        Files.createDirectories(monthDir);

        // Clean filename & generate unique stored filename
        String original = StringUtils.cleanPath(file.getOriginalFilename() == null ? "" : file.getOriginalFilename());
        String ext = original.lastIndexOf('.') >= 0 ? original.substring(original.lastIndexOf('.')) : "";
        String stored = "att-" + UUID.randomUUID() + ext;

        // Copy file to disk
        Path target = monthDir.resolve(stored);
        Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

        // Build Attachment entity
        Attachment att = new Attachment();
        att.setOriginalFilename(original.isBlank() ? stored : original);
        att.setStoredFilename(stored);
        att.setContentType(file.getContentType() == null ? "application/octet-stream" : file.getContentType());
        att.setSize(file.getSize());
        Path rel = root.relativize(target);
        att.setRelativePath(rel.toString().replace('\\', '/'));
        att.setRepairRequest(req);
        att.setCreatedAt(Instant.now());
        att.setDescription(description);

        // Save metadata to DB
        return attachmentRepo.save(att);
    }

    // 🔹 Resolve the physical file path from an Attachment
    public Path resolvePath(Attachment att) {
        return Paths.get(uploadDir).toAbsolutePath().normalize().resolve(att.getRelativePath());
    }

    // 🔹 Delete attachment by ID
    public void delete(Long attachmentId) throws IOException {
        Attachment att = attachmentRepo.findById(attachmentId)
                .orElseThrow(() -> new IllegalArgumentException("Attachment not found: " + attachmentId));

        Path path = resolvePath(att);
        attachmentRepo.delete(att);

        try {
            Files.deleteIfExists(path);
        } catch (Exception ignored) {}
    }

    // 🔹 Delete all attachments by RepairRequest ID
    public void deleteByRepairId(Long repairId) {
        List<Attachment> attachments = listByRequest(repairId);
        attachmentRepo.deleteAll(attachments);
    }

    // 🔹 Save attachment (used for manual save with RepairRequest object)
    public void saveAttachment(MultipartFile file, RepairRequest req) {
        try {
            // Generate unique filename
            String storedFilename = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();

            // Organize by date (YYYY/MM/DD)
            String datePath = LocalDate.now().toString().replace("-", "/");
            Path uploadDirPath = rootLocation.resolve(datePath);
            Files.createDirectories(uploadDirPath);

            // Save file
            Path filePath = uploadDirPath.resolve(storedFilename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Save metadata
            Attachment a = new Attachment();
            a.setRepairRequest(req);
            a.setOriginalFilename(file.getOriginalFilename());
            a.setStoredFilename(storedFilename);
            a.setContentType(file.getContentType());
            a.setSize(file.getSize());
            a.setRelativePath(datePath + "/" + storedFilename);

            attachmentRepo.save(a);

        } catch (IOException e) {
            throw new RuntimeException("❌ Failed to save file: " + e.getMessage(), e);
        }
    }

    // 🔹 Get single attachment by ID
    public Attachment getAttachment(Long id) {
        return attachmentRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("File not found"));
    }
}
