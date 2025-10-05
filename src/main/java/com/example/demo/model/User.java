package com.example.demo.model;

import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username;
    private String fullName;
    private String email;
    private String role;

    // getters & setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setName(String name) { this.username = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
	public String getRole() { return role; }
	public void setRole(String role) { this.role = role; }
	
	public String getFullName() { return fullName; }
	public void setFullName(String fullName) { this.fullName = fullName; }
    
	public void updatedProfile() {
		
	}
    
}