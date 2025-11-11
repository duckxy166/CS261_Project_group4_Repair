package com.example.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.example.demo.model.Feedback;
import com.example.demo.repository.FeedbackRepository;

@RestController
@RequestMapping("/api/feedback")
@CrossOrigin(origins = "*") // อนุญาตให้หน้า HTML เรียก API ได้
public class FeedbackController {

    @Autowired
    private FeedbackRepository feedbackRepository;

    @PostMapping("/submit")
    public Feedback submitFeedback(@RequestBody Feedback feedback) {
        return feedbackRepository.save(feedback);
    }
    
    @GetMapping("/next-id")
    public long getNextFeedbackId() {
        // ดึง ID ล่าสุดจากฐานข้อมูล
        return feedbackRepository.findAll().stream()
                .mapToLong(Feedback::getId)
                .max()
                .orElse(0L) + 1;
    }

}
