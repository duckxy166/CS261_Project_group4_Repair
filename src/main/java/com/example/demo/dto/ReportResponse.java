package com.example.demo.dto;

import java.time.LocalDateTime;

public class ReportResponse {
    private Long id;
    private String status;
    private String technician;
    private String title;
    private String location;
    private String description;
    private String reporterName;
    private LocalDateTime createdAt;
    private String category;
    
    // constructor
    public ReportResponse(Long id, String status, String technician) {
        this.id = id;
        this.status = status;
        this.technician = technician;
    }
    public ReportResponse(Long id, String status, String technician, String title, String location, String reporterName, LocalDateTime createdAt) {
        this.id = id;
        this.status = status;
        this.technician = technician;
        this.title = title;
        this.location = location;
        this.reporterName = reporterName;
        this.createdAt = createdAt;
    }
    public ReportResponse(Long id, String status, String technician, String title,
            String location, String description, String reporterName,
            LocalDateTime createdAt, String category) {
	this.id = id;
	this.status = status;
	this.technician = technician;
	this.title = title;
	this.location = location;
	this.description = description;
	this.reporterName = reporterName;
	this.createdAt = createdAt;
	this.category = category;
	
    }
    // getters
    public Long getId() { return id; }
    public String getStatus() { return status; }
    public String getTechnician() { return technician; }
    public String getTitle() { return title; }
    public String getLocation() { return location; }
    public String getDescription() { return description; }
    public String getReporterName() { return reporterName; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public String getCategory(){ return category; }
	

}
