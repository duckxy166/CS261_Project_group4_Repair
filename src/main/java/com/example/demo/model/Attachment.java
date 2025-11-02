package com.example.demo.model;

import jakarta.persistence.*;
import java.time.Instant;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "attachments")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Attachment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ชื่อไฟล์เดิมที่ผู้ใช้อัปโหลด
    @Column(nullable = false)
    private String originalFilename;

    // ชื่อไฟล์ที่เก็บจริง (สุ่ม)
    @Column(nullable = false, unique = true)
    private String storedFilename;

    // MIME type
    @Column(nullable = false)
    private String contentType;

    // ขนาดไฟล์ (bytes)
    @Column(nullable = false)
    private long size;

    // path แบบ relative จาก root upload dir (เช่น "2025/10/attach-xxxx.bin")
    @Column(nullable = false)
    private String relativePath;

    // คำอธิบายจากช่าง
    @Column(length = 500)
    private String description;
    
    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    // ความสัมพันธ์กับคำขอซ่อม
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "repair_request_id")
    @JsonIgnoreProperties({"attachments", "reporter", "hibernateLazyInitializer", "handler"})
    private RepairRequest repairRequest;
    
 // ความสัมพันธ์กับรายงานซ่อม (สามารถเป็น NULL ได้)
    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "repair_report_id", nullable = true)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private RepairReport repairReport;
    // ===== Getter & Setter =====

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getOriginalFilename() {
        return originalFilename;
    }

    public void setOriginalFilename(String originalFilename) {
        this.originalFilename = originalFilename;
    }

    public String getStoredFilename() {
        return storedFilename;
    }

    public void setStoredFilename(String storedFilename) {
        this.storedFilename = storedFilename;
    }

    public String getContentType() {
        return contentType;
    }

    public void setContentType(String contentType) {
        this.contentType = contentType;
    }

    public long getSize() {
        return size;
    }

    public void setSize(long size) {
        this.size = size;
    }

    public String getRelativePath() {
        return relativePath;
    }

    public void setRelativePath(String relativePath) {
        this.relativePath = relativePath;
    }
    
    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
    
    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public RepairRequest getRepairRequest() {
        return repairRequest;
    }

    public void setRepairRequest(RepairRequest repairRequest) {
        this.repairRequest = repairRequest;
    }
    public RepairReport getRepairReport() {
        return repairReport;
    }

    public void setRepairReport(RepairReport repairReport) {
        this.repairReport = repairReport;
    }
}
