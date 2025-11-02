package com.example.demo.dto;

public class RepairReportRequest {
    private String fullName;
    private String detail;
    private String updStatus;
    private Long repairRequestId; // optional

    // Getters and Setters
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