package com.example.demo.dto;

public class ReportResponse {
    private Long id;
    private String status;
    private String technician;

    // constructor
    public ReportResponse(Long id, String status, String technician) {
        this.id = id;
        this.status = status;
        this.technician = technician;
    }

    // getters
    public Long getId() { return id; }
    public String getStatus() { return status; }
    public String getTechnician() { return technician; }
}
