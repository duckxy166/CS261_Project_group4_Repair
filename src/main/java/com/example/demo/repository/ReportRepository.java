package com.example.demo.repository;

import com.example.demo.model.RepairRequest;
import com.example.demo.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<RepairRequest, Long> {
	// Find all repair requests by reporter's username
    List<RepairRequest> findByReporterUsername(String username);

    // Find all reports with a specific status
    List<RepairRequest> findByStatus(String status);

    // Find all reports for a specific reporter (User)
    List<RepairRequest> findByReporter(User reporter);

    // Optionally, find reports by reporter and status
    List<RepairRequest> findByReporterAndStatus(User reporter, String status);
}
