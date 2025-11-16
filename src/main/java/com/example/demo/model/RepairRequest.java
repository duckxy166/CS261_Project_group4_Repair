package com.example.demo.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import java.time.LocalDateTime;
//import lombok.Data;
//import lombok.NoArgsConstructor;
//import lombok.AllArgsConstructor;

// 1. เพิ่ม imports ที่จำเป็น
import jakarta.persistence.OneToOne;
import jakarta.persistence.FetchType;
import jakarta.persistence.Transient;

@Entity
public class RepairRequest {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	@Column(name = "title", columnDefinition = "NVARCHAR(255)") // for read Thai text
	private String title;
	@Column(name = "description", columnDefinition = "NVARCHAR(255)")
	private String description;
	@Column(name = "cause", columnDefinition = "NVARCHAR(MAX)")
	private String cause;
	@Column(name = "method", columnDefinition = "NVARCHAR(MAX)")
	private String method;
	@Column(name = "parts", columnDefinition = "NVARCHAR(MAX)")
	private String parts;
	@Column(name = "status", columnDefinition = "NVARCHAR(100)")
	private String status = "รอดำเนินการ";
	@Column(name = "technician", columnDefinition = "NVARCHAR(255)")
	private String technician;
	@Column(name = "priority", columnDefinition = "NVARCHAR(100)")
	private String priority;
	@Column(name = "location", columnDefinition = "NVARCHAR(100)")
	private String location;
	@Column(name = "category", columnDefinition = "NVARCHAR(100)")
	private String category;
	@Column(name = "location_detail", columnDefinition = "NVARCHAR(255)")
	private String locationDetail;

	@Column(updatable = false)
	@JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
	private LocalDateTime createdAt;

	@JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
	private LocalDateTime updatedAt;

	@ManyToOne
	@JoinColumn(name = "reporter_id", nullable = false)
	private User reporter;

	// 2. เพิ่มความสัมพันธ์ OneToOne ไปยัง Feedback
	@OneToOne(mappedBy = "report", fetch = FetchType.LAZY)
	private Feedback feedback;


	// getters & setters (ของเดิม)
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

	public String getCause() {
		return cause;
	}

	public void setCause(String cause) {
		this.cause = cause;
	}

	public String getMethod() {
		return method;
	}

	public void setMethod(String method) {
		this.method = method;
	}

	public String getParts() {
		return parts;
	}

	public void setParts(String parts) {
		this.parts = parts;
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
		this.location = location;
	}

	public String getLocation() {
		return location;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public String getCategory() {
		return category;
	}

	public void setCategory(String category) {
		this.category = category;
	}

	public String getLocationDetail() {
		return locationDetail;
	}

	public void setLocationDetail(String locationDetail) {
		this.locationDetail = locationDetail;
	}

	// 3. เพิ่ม Getter/Setter สำหรับ feedback
	public Feedback getFeedback() {
		return feedback;
	}

	public void setFeedback(Feedback feedback) {
		this.feedback = feedback;
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
		System.out.println("=== MODEL updateStatus ===");
		System.out.println("New Status = " + newStatus);
		System.out.println("TechnicianUser = " + (technicianUser != null ? technicianUser.getFullName() : "NULL"));
		System.out.println("=================================");

		this.status = newStatus;
		if (technicianUser != null) {
			this.technician = technicianUser.getFullName() != null ? technicianUser.getFullName()
					: technicianUser.getUsername();
		}
		if (technicianUser != null && technicianUser.getFullName() != null) {
			System.out.println("SET TECHNICIAN = " + technicianUser.getFullName());
			this.technician = technicianUser.getFullName();
		} else {
			System.out.println("NOT SET TECHNICIAN!");
		}

		this.updatedAt = LocalDateTime.now();
	}

	// 4. เพิ่ม Transient Getters เพื่อให้ Jackson นำไปใส่ใน JSON
	// โดยจะดึงข้อมูลมาจาก field feedback ที่เชื่อมกันไว้
	
	@Transient
	public int getFeedbackRating() {
		if (this.feedback != null) {
			return this.feedback.getRating();
		}
		return 0; // ค่า default หากยังไม่มี feedback
	}

	@Transient
	public String getFeedbackComment() {
		if (this.feedback != null) {
			return this.feedback.getMessage();
		}
		return null; // ค่า default หากยังไม่มี feedback
	}
}