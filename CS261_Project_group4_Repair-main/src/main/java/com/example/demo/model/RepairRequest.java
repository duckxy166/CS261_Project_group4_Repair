package com.example.demo.model;

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

    private String title;
    private String description;
    private String status;
    private String priotity;
    private String technician;
    
    @Column(updatable = false)
    private LocalDateTime createdAt;

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
    
    public void setDescription(String x) {
    	this.description = x;
    }
    public void setStatus(String x) {
    	this.status = x;
    }
    public String getLocation() {
    	return title;
    }
    public String getDescription() {
    	return description;
    }
    public String getStatus() {
    	return status;
    }

	public String getPriotity() {
		return priotity;
	}

	public void setPriotity(String priotity) {
		this.priotity = priotity;
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
	
	@PrePersist
	protected void onCreate() {
	    this.createdAt = LocalDateTime.now();
	    this.updatedAt = LocalDateTime.now();
	}

	@PreUpdate
	protected void onUpdate() {
	    this.updatedAt = LocalDateTime.now();
	}
	
	public void assignTo(User x) {
		if(x.getRole()=="Technician") {
			this.setTechnician(x.getFullName());
		}else {
			
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