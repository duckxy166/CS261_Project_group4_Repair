package com.example.demo.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.*;

@Entity
@Table(name = "repair_report")
public class RepairReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "full_name", nullable = true, columnDefinition = "NVARCHAR(255)")
    private String fullName;

    @Column(name = "detail", nullable = true, columnDefinition = "NVARCHAR(500)")
    private String detail;

    @Column(name = "upd_status", nullable = true, columnDefinition = "NVARCHAR(100)")
    private String updStatus;
    
    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "repair_request_id", nullable = true)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private RepairRequest repairRequest;
    
    // ===== Getter & Setter =====

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getDetail() {
        return detail;
    }

    public void setDetail(String detail) {
        this.detail = detail;
    }

    public String getUpdStatus() {
        return updStatus;
    }

    public void setUpdStatus(String updStatus) {
        this.updStatus = updStatus;
    }
    
    public RepairRequest getRepairRequest() {
        return repairRequest;
    }

    public void setRepairRequest(RepairRequest repairRequest) {
        this.repairRequest = repairRequest;
    }
}
