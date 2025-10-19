package com.example.demo.service;

import com.example.demo.model.Attachment;
import com.example.demo.model.RepairRequest;
import com.example.demo.repository.AttachmentRepository;
import com.example.demo.repository.ReportRepository;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
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
public class FileStorageService {
    private final AttachmentRepository attachmentRepo;
    private final ReportRepository repairRepo;

    @Value("${storage.upload-dir}")
    private String uploadDir;
    
    public FileStorageService(AttachmentRepository attachmentRepo, ReportRepository repairRepo) {
        this.attachmentRepo = attachmentRepo;
        this.repairRepo = repairRepo;
    }

    public List<Attachment> listByRequest(Long requestId) {
        return attachmentRepo.findByRepairRequestId(requestId);
    }

    public Attachment store(Long requestId, MultipartFile file, String description) throws IOException {
        if (file == null || file.isEmpty()) 
        	throw new IllegalArgumentException("Empty file");

        RepairRequest req = repairRepo.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("RepairRequest not found: " + requestId));

        Path root = Paths.get(uploadDir).toAbsolutePath().normalize();
        Files.createDirectories(root);

        LocalDate today = LocalDate.now();
        Path monthDir = root.resolve(today.getYear() + "/" + String.format("%02d", today.getMonthValue()));
        Files.createDirectories(monthDir);

        String original = StringUtils.cleanPath(file.getOriginalFilename() == null ? "" : file.getOriginalFilename());
        String ext = original.lastIndexOf('.') >= 0 ? original.substring(original.lastIndexOf('.')) : "";
        String stored = "att-" + UUID.randomUUID() + ext;
        Path target = monthDir.resolve(stored);
        Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

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

        return attachmentRepo.save(att);
    }

    public Path resolvePath(Attachment att) {
        return Paths.get(uploadDir).toAbsolutePath().normalize().resolve(att.getRelativePath());
    }

    public void delete(Long attachmentId) throws IOException {
        Attachment att = attachmentRepo.findById(attachmentId)
                .orElseThrow(() -> new IllegalArgumentException("Attachment not found: " + attachmentId));
        
        Path p = resolvePath(att);
        attachmentRepo.delete(att);
        
        try { 
        	Files.deleteIfExists(p); 
        } catch (Exception ignored) {}
    }
}
