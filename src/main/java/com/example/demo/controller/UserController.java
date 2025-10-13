package com.example.demo.controller;

import com.example.demo.model.User;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users") // กำหนด path หลักสำหรับ user
public class UserController {

    @GetMapping("/current") // Endpoint คือ /api/users/current
    public ResponseEntity<User> getCurrentUser(HttpSession session) {
        // ดึงข้อมูล User object ที่เราเก็บไว้ใน session ตอน login
        User currentUser = (User) session.getAttribute("user");

        if (currentUser != null) {
            // ถ้ามี user ใน session, ส่งข้อมูล user กลับไปพร้อม status 200 OK
            return ResponseEntity.ok(currentUser);
        } else {
            // ถ้าไม่มีใคร login, ส่ง status 401 Unauthorized กลับไป
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }
}