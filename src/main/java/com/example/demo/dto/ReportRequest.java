package com.example.demo.dto;

public class ReportRequest {
    private Long id;
    private String status;
    private Long technicianId; // optional
    private String priority;

    // getters & setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Long getTechnicianId() { return technicianId; }
    public void setTechnicianId(Long technicianId) { this.technicianId = technicianId; }
    
    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
}
