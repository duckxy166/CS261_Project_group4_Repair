package com.example.demo.controller;

import com.example.demo.dto.LoginRequest;
import com.example.demo.dto.TUApiResponse;
import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.HttpClientErrorException;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import jakarta.servlet.http.HttpSession;

@RestController
public class LoginController {

    @Autowired
    private UserRepository userRepository;

    @Value("${tu.api.url:https://restapi.tu.ac.th/api/v1/auth/Ad/verify2}")
    private String tuApiUrl;

    @Value("${tu.api.key}")
    private String applicationKey;

    private final RestTemplate restTemplate = new RestTemplate();

    @PostMapping("/api/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest, HttpSession session) {
        System.out.println("Login attempt - username: " + loginRequest.getUsername());
        
        // ตรวจสอบ Local Admin/Test Users ก่อน
        Optional<User> localUser = userRepository.findByUsername(loginRequest.getUsername());
        if (localUser.isPresent() && localUser.get().getPassword() != null) {
            User user = localUser.get();
            if (user.getPassword().equals(loginRequest.getPassword())) {
                System.out.println("Local login successful for: " + user.getUsername());
                session.setAttribute("user", user);
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Login successful");
                response.put("role", user.getRole());
                response.put("username", user.getUsername());
                response.put("fullName", user.getFullName());
                response.put("email", user.getEmail());
                return ResponseEntity.ok(response);
            }
        }
        
        // ถ้าไม่ใช่ local user ให้ลอง TU API
        try {
            // เรียก TU REST API
            TUApiResponse tuResponse = verifyWithTUApi(
                loginRequest.getUsername(), 
                loginRequest.getPassword()
            );
            
            if (tuResponse != null && tuResponse.isStatus()) {
                // Login สำเร็จ - บันทึกหรืออัพเดทข้อมูลผู้ใช้ในฐานข้อมูล
                User user = saveOrUpdateUser(tuResponse);
                session.setAttribute("user", user);
                
                // ส่งข้อมูลกลับไปยัง Frontend
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Login successful");
                response.put("role", user.getRole());
                response.put("username", user.getUsername());
                response.put("fullName", user.getFullName());
                response.put("email", user.getEmail());
                
                return ResponseEntity.ok(response);
            } else {
                // Login ไม่สำเร็จ
                return ResponseEntity.status(401)
                    .body(Map.of("success", false, "message", "Invalid credentials"));
            }
            
        } catch (HttpClientErrorException e) {
            System.err.println("TU API Error: " + e.getStatusCode() + " - " + e.getMessage());
            return ResponseEntity.status(401)
                .body(Map.of("success", false, "message", "Invalid credentials"));
                
        } catch (Exception e) {
            System.err.println("Login error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500)
                .body(Map.of("success", false, "message", "Server error: " + e.getMessage()));
        }
    }

    
    
    @GetMapping("/api/profile")
    public ResponseEntity<?> getProfile(HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("success", false, "message", "Not logged in"));
        }
        
        return ResponseEntity.ok(Map.of(
            "username", user.getUsername(),
            "fullName", user.getFullName(),
            "email", user.getEmail(),
            "role", user.getRole()
        ));
    }
    
    /**
     * เรียก TU REST API เพื่อตรวจสอบข้อมูลผู้ใช้
     */
    private TUApiResponse verifyWithTUApi(String username, String password) {
        try {
            // สร้าง Headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Application-Key", applicationKey);
            
            // สร้าง Request Body
            Map<String, String> requestBody = new HashMap<>();
            requestBody.put("UserName", username);
            requestBody.put("PassWord", password);
            
            HttpEntity<Map<String, String>> entity = new HttpEntity<>(requestBody, headers);
            
            // เรียก API
            System.out.println("Calling TU API: " + tuApiUrl);
            ResponseEntity<TUApiResponse> response = restTemplate.exchange(
                tuApiUrl,
                HttpMethod.POST,
                entity,
                TUApiResponse.class
            );
            
            System.out.println("TU API Response: " + response.getBody());
            return response.getBody();
            
        } catch (Exception e) {
            System.err.println("Error calling TU API: " + e.getMessage());
            throw e;
        }
    }

    /**
     * บันทึกหรืออัพเดทข้อมูลผู้ใช้ในฐานข้อมูล
     */
    private User saveOrUpdateUser(TUApiResponse tuResponse) {
        Optional<User> existingUser = userRepository.findByUsername(tuResponse.getUsername());
        
        User user;
        if (existingUser.isPresent()) {
            // อัพเดทข้อมูลผู้ใช้เดิม
            user = existingUser.get();
        } else {
            // สร้างผู้ใช้ใหม่
            user = new User();
            user.setUsername(tuResponse.getUsername());
        }
        
        // อัพเดทข้อมูล
        user.setFullName(tuResponse.getDisplayname_en());
        user.setEmail(tuResponse.getEmail());
        
        // กำหนด role (ปรับตามความต้องการ)
        // ถ้าเป็นนักศึกษาให้ role = "Student", ถ้าเป็นบุคลากรให้ role = "Staff"
        String role = determineRole(tuResponse.getType());
        user.setRole(role);
        
        // บันทึกลงฐานข้อมูล
        return userRepository.save(user);
    }

    /**
     * กำหนด role ตาม type ที่ได้จาก TU API
     */
    private String determineRole(String type) {
        if (type == null) return "Student";
        
        switch (type.toLowerCase()) {
            case "student":
                return "Student";
            case "employee":
            case "staff":
                return "Staff";
            default:
                return "Student";
        }
    }

    /**
     * Webhook endpoint สำหรับ TU API (POST)
     */
    @PostMapping("/api/webhook")
    public ResponseEntity<?> webhook(@RequestBody Map<String, Object> payload) {
        System.out.println("Webhook received: " + payload);
        
        // ตอบกลับด้วย 200 OK
        Map<String, String> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Webhook received");
        
        return ResponseEntity.ok(response);
    }

    /**
     * Webhook endpoint สำหรับ TU API ทดสอบ (GET)
     */
    @GetMapping("/api/webhook")
    public ResponseEntity<?> webhookGet() {
        System.out.println("Webhook health check");
        
        Map<String, String> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Webhook endpoint is ready");
        
        return ResponseEntity.ok(response);
    }
}