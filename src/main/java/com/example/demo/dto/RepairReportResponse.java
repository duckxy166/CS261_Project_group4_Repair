package com.example.demo.dto;

public class RepairReportResponse {
    private Long id;
    private String fullName;
    private String detail;
    private String updStatus;
    private Long repairRequestId;

    public RepairReportResponse(Long id, String fullName, String detail, String updStatus, Long repairRequestId) {
        this.id = id;
        this.fullName = fullName;
        this.detail = detail;
        this.updStatus = updStatus;
        this.repairRequestId = repairRequestId;
    }

    // Getters and Setters
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

    public Long getRepairRequestId() {
        return repairRequestId;
    }

    public void setRepairRequestId(Long repairRequestId) {
        this.repairRequestId = repairRequestId;
    }
}