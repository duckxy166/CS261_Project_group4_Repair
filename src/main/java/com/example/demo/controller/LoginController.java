package com.example.demo.controller;

import com.example.demo.dto.LoginRequest;
import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
public class LoginController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/api/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        System.out.println("Input username = [" + loginRequest.getUsername() + "]");
        System.out.println("Input password = [" + loginRequest.getPassword() + "]");
        Optional<User> optionalUser = userRepository.findByUsername(loginRequest.getUsername());
        System.out.println("User exists? " + optionalUser.isPresent());
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            System.out.println("DB password = [" + user.getPassword() + "]");
            if (user.getPassword().equals(loginRequest.getPassword())) {
                Map<String, String> res = new HashMap<>();
                res.put("role", user.getRole());
                res.put("username", user.getUsername());
                return ResponseEntity.ok(res);
            }
        }
        return ResponseEntity.status(401).body("Invalid credentials");
    }
    
}