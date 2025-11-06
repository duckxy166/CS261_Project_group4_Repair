package com.example.demo; // (หรือแพ็คเกจที่คุณใช้)

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

// นี่คือ Filter ที่เราสร้างขึ้นมาเอง
public class CacheControlFilter implements Filter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        
        // แปลง response ให้เป็น
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        
        // นี่คือหัวใจสำคัญ: "บังคับ" ใส่ Header ห้าม Cache 3 ตัวนี้
        httpResponse.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        httpResponse.setHeader("Pragma", "no-cache");
        httpResponse.setHeader("Expires", "0");
        
        // สั่งให้ทำงานต่อไป (เพื่อให้ Filter ตัวอื่นทำงานต่อ)
        chain.doFilter(request, response);
    }
}