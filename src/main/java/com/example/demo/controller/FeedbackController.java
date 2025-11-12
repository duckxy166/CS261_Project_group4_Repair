package com.example.demo.controller;

import com.example.demo.model.Feedback;
import com.example.demo.model.RepairRequest;
import com.example.demo.model.User;
import com.example.demo.repository.FeedbackRepository;
import com.example.demo.repository.ReportRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/feedback")
public class FeedbackController {

    private final FeedbackRepository feedbackRepository;
    private final ReportRepository reportRepository;

    public FeedbackController(FeedbackRepository feedbackRepository, ReportRepository reportRepository) {
        this.feedbackRepository = feedbackRepository;
        this.reportRepository = reportRepository;
    }

    @PostMapping
    public ResponseEntity<?> createFeedback(@RequestBody Feedback feedback, HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        // เชื่อมกับรายงานซ่อมที่ส่งมา
        RepairRequest report = reportRepository.findById(feedback.getReportId())
                .orElse(null);

        if (report == null) {
            return ResponseEntity.badRequest().body("Report not found");
        }

        feedback.setUser(user);
        feedback.setReport(report);
        feedback.setCreatedAt(LocalDateTime.now());

        feedbackRepository.save(feedback);
        return ResponseEntity.ok("Feedback saved");
    }
}