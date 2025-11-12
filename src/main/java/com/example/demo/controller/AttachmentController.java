package com.example.demo.controller;

import com.example.demo.model.Attachment;
import com.example.demo.repository.AttachmentRepository;
import com.example.demo.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

@RestController
@RequestMapping("/api/files/{requestId}")
@RequiredArgsConstructor
public class AttachmentController {

    private final AttachmentRepository attachmentRepo;
    private final FileStorageService storage;
    
    // ---------------- List attachments ----------------
    @GetMapping
    public List<Attachment> list(@PathVariable Long requestId) {
        return storage.listByRequest(requestId);
    }

    // ---------------- Upload new attachment ----------------
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Attachment upload(
            @PathVariable Long requestId,
            @RequestPart("file") MultipartFile file,
            @RequestParam("description") String description
    ) throws IOException {
        return storage.store(requestId, file, description);
    }

    // ---------------- Download attachment ----------------
    @GetMapping("/{attachmentId}/download")
    public ResponseEntity<Resource> download(
            @PathVariable Long requestId,
            @PathVariable Long attachmentId
    ) throws IOException {
        Attachment att = storage.listByRequest(requestId).stream()
                .filter(a -> a.getId().equals(attachmentId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Attachment not found"));

        Path filePath = storage.resolvePath(att); // ✅ Use service
        Resource resource = storage.resolvePath(att).toUri().toURL().openStream() != null ?
                new org.springframework.core.io.PathResource(filePath) : null;

        if (!Files.exists(filePath)) {
            return ResponseEntity.notFound().build();
        }

        String contentType = Files.probeContentType(filePath);
        if (contentType == null) contentType = att.getContentType();

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment()
                                .filename(att.getOriginalFilename())
                                .build().toString())
                .body(new org.springframework.core.io.PathResource(filePath));
    }

    // ---------------- Delete attachment ----------------
    @DeleteMapping("/{attachmentId}")
    public ResponseEntity<Void> delete(
            @PathVariable Long requestId,
            @PathVariable Long attachmentId
    ) throws IOException {
        storage.delete(attachmentId);
        return ResponseEntity.noContent().build();
    }
}
