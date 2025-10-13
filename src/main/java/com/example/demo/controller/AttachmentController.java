package com.example.demo.controller;

import com.example.demo.model.Attachment;
import com.example.demo.service.FileStorageService;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.PathResource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.util.List;

@RestController
@RequestMapping("/api/files/{requestId}")
@RequiredArgsConstructor
public class AttachmentController {
	
	@Autowired
    private FileStorageService storage;

    @GetMapping
    public List<Attachment> list(@PathVariable Long requestId) {
        return storage.listByRequest(requestId);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Attachment upload(@PathVariable Long requestId,
                             @RequestPart("file") MultipartFile file) throws IOException {
        return storage.store(requestId, file);
    }

    @GetMapping("/{attachmentId}/download")
    public ResponseEntity<PathResource> download(@PathVariable Long requestId,
                                                 @PathVariable Long attachmentId) throws IOException {
        Attachment att = storage.listByRequest(requestId).stream()
                .filter(a -> a.getId().equals(attachmentId))
                .findFirst().orElseThrow(() -> new IllegalArgumentException("Attachment not found"));

        var path = storage.resolvePath(att);
        var resource = new PathResource(path);
        if (!resource.exists()) return ResponseEntity.notFound().build();

        String contentType = Files.probeContentType(path);
        if (contentType == null) contentType = att.getContentType();

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_LENGTH, String.valueOf(att.getSize()))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment()
                                .filename(att.getOriginalFilename())
                                .build().toString())
                .body(resource);
    }

    @DeleteMapping("/{attachmentId}")
    public ResponseEntity<Void> delete(@PathVariable Long requestId,
                                       @PathVariable Long attachmentId) throws IOException {
        storage.delete(attachmentId);
        return ResponseEntity.noContent().build();
    }
}
