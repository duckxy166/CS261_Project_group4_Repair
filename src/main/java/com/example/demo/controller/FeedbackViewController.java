package com.example.demo.controller;


import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

import com.example.demo.model.Feedback;
import com.example.demo.repository.FeedbackRepository;

import jakarta.servlet.http.HttpServletResponse;

@Controller
public class FeedbackViewController {

    @Autowired
    private FeedbackRepository feedbackRepository;

    @GetMapping("/feedback")
    public void redirectToFeedback(HttpServletResponse response) throws IOException {
        long nextId = feedbackRepository.findAll().stream()
                .mapToLong(Feedback::getId)
                .max()
                .orElse(0L) + 1;
        response.sendRedirect("/feedback.html?id=" + nextId);
    }
}
