package com.example.demo.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import java.time.LocalDateTime;
//import lombok.Data;
//import lombok.NoArgsConstructor;
//import lombok.AllArgsConstructor;

@Entity
public class RepairRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "title", columnDefinition = "NVARCHAR(255)")//for read Thai text
    private String title;
    @Column(name = "description", columnDefinition = "NVARCHAR(255)")
    private String description;
    @Column(name = "status", columnDefinition = "NVARCHAR(100)")
    private String status = "รอดำเนินการ";
    @Column(name = "technician", columnDefinition = "NVARCHAR(255)")
    private String technician;
    @Column(name = "priority", columnDefinition = "NVARCHAR(100)")
    private String priority;
    @Column(name = "location", columnDefinition = "NVARCHAR(100)")
    private String location;
    
    @Column(updatable = false)
    @JsonFormat(pattern="yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;

    @JsonFormat(pattern="yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;

    
    @ManyToOne
    @JoinColumn(name = "reporter_id", nullable = false)
    private User reporter;

    // getters & setters
    public long getId() {
    	return id;
    }
    public void setTitle(String x) {
    	this.title = x;
    }
    public User getReporter() {
        return reporter;
    }
    public void setReporter(User reporter) {
        this.reporter = reporter;
    }
    public void setDescription(String x) {
    	this.description = x;
    }
    public void setStatus(String x) {
    	this.status = x;
    }
    public String getTitle() {
    	return title;
    }
    public String getDescription() {
    	return description;
    }
    public String getStatus() {
    	return status;
    }

	public String getPriority() {
		return priority;
	}

	public void setPriority(String priority) {
		this.priority = priority;
	}
	public String getTechnician() {
		return technician;
	}
	
	public void setTechnician(String technician) {
		this.technician = technician;
	}
	public void setUpdatedAt(LocalDateTime updatedAt) {
	    this.updatedAt = updatedAt;
	}
	
	public void setLocation(String location) {
		this.technician = location;
	}
	public String getLocation() {
	    return location;
	}
	@PrePersist
	protected void onCreate() {
	    this.createdAt = LocalDateTime.now();
	    this.updatedAt = LocalDateTime.now();
	}

	@PreUpdate
	protected void onUpdate() {
	    this.updatedAt = LocalDateTime.now();
	}
	
	public void assignTo(User user) {
        if (user != null && "Technician".equalsIgnoreCase(user.getRole())) {
            this.technician = user.getFullName();
        }
    }
	
	public void updateStatus(String newStatus, User technicianUser) {
	    // Only assign technician if current status is Pending and technician is provided
	    if ("Pending".equalsIgnoreCase(this.status) && technicianUser != null && "Technician".equalsIgnoreCase(technicianUser.getRole())) {
	        this.technician = technicianUser.getFullName();
	    }
	    
	    // Always update status and timestamp
	    this.status = newStatus;
	    this.updatedAt = LocalDateTime.now();
	}
	
}