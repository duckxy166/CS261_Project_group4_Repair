package com.example.demo.dto;

public class ReportUpdateRequest {
    private String status;       
    private String technician;   
    private String priority;     

    public String getStatus() {
        return status;
    }
    public void setStatus(String status) {
        this.status = status;
    }

    public String getTechnician() {
        return technician;
    }
    public void setTechnician(String technician) {
        this.technician = technician;
    }

    public String getPriority() {
        return priority;
    }
    public void setPriority(String priority) {
        this.priority = priority;
    }
}
