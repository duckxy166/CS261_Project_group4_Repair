package com.example.demo;

import com.example.demo.model.User; 
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.core.GrantedAuthorityDefaults;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.security.web.context.SecurityContextHolderFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

class SessionUserFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        HttpSession session = request.getSession(false); 
        SecurityContext context = SecurityContextHolder.getContext();

        if (session == null || context.getAuthentication() != null) {
            filterChain.doFilter(request, response);
            return;
        }

        User user = (User) session.getAttribute("user");

        if (user != null) {
            String role = user.getRole();
            List<GrantedAuthority> authorities = new ArrayList<>();
            
            if (role != null && !role.isBlank()) {
                authorities.add(new SimpleGrantedAuthority(role));
            }

            Authentication auth = new UsernamePasswordAuthenticationToken(
                    user.getUsername(), 
                    null,               
                    authorities         
            );
            
            context.setAuthentication(auth);
        }

        filterChain.doFilter(request, response);
    }
}



@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public GrantedAuthorityDefaults grantedAuthorityDefaults() {
        return new GrantedAuthorityDefaults(""); 
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                
                .addFilterBefore(new CacheControlFilter(), SecurityContextHolderFilter.class)
                
                .headers(headers -> headers.disable())
                
                .addFilterBefore(new SessionUserFilter(), UsernamePasswordAuthenticationFilter.class)

                .authorizeHttpRequests(authorize -> authorize
                        
                        .requestMatchers(
                        		"/",
                                "/login.html",   
                                "/login.css",
                                "/login.js",
                                "/api/login",
                                "/api/logout",
                                "/api/webhook",  
                                "/error",
                                "/history.css"        
                        ).permitAll()
                        
                        .requestMatchers("/dashboard.html", "/dashboard.css", "/dashboard.js").hasAuthority("admin")

                        .requestMatchers("/RepairList.html", "/RepairList.css", "/RepairList.js", "/RepairReportCRS.html", "/RepairReportCRS.css", "/RepairReportCRS.js"
                                ).hasAuthority("tech")
                        
                        .requestMatchers(
                                "/index.html", 
                                "/index.css", 
                                "/RepairRequest.html", 
                                "/RepairRequest.css",
                                "/RepairRequest.js",
                                "/track.html", 
                                "/track.css", 
                                "/track.js", 
                                "/history.html",
                                "/history.js",
                                "/common.js"
                        ).hasAnyAuthority("Student", "Staff")

                        .requestMatchers(
                                "/api/requests/**", 
                                "/api/files/**", 
                                "/api/users/current", 
                                "/api/profile"
                        ).authenticated()

                        .anyRequest().authenticated()
                )

                .exceptionHandling(exceptions -> exceptions
                        
                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            response.sendRedirect(request.getContextPath() + "/login.html?access_denied=true");
                        })
                        
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.sendRedirect(request.getContextPath() + "/login.html?unauthenticated=true");
                        })
                )

                .formLogin(AbstractHttpConfigurer::disable)
                .logout(logout -> logout
                        .logoutUrl("/api/logout") 
                        .invalidateHttpSession(true) 
                        .deleteCookies("JSESSIONID") 
                        .logoutSuccessHandler((request, response, authentication) -> {
                            response.setStatus(HttpServletResponse.SC_OK);
                        })
                );

        return http.build();
    }
}