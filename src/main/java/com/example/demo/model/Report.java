package com.example.demo.model;

import jakarta.persistence.*;
//import lombok.Data;
//import lombok.NoArgsConstructor;
//import lombok.AllArgsConstructor;

@Entity
public class Report {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String location;
    private String description;
    private String status; // e.g., "Pending", "In Progress", "Completed"
    @ManyToOne
    private UserData reporter;

    // getters & setters
    public void setLocation(String x) {
    	this.location= x;
    }
    
    public void setDescription(String x) {
    	this.description= x;
    }
    public void setStatus(String x) {
    	this.status= x;
    }
    public String getLocation() {
    	return this.location;
    }
    public String getDescription() {
    	return this.description;
    }
    public String getStatus() {
    	return this.status;
    }
}