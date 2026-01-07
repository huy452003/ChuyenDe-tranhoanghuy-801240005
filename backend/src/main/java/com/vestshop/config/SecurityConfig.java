package com.vestshop.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity // Enable @PreAuthorize, @PostAuthorize, etc.
public class SecurityConfig {

    @Autowired
    private JwtAuthFilter jwtAuthFilter;

    @Autowired
    private CorsConfigurationSource corsConfigurationSource;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/register", "/api/auth/login", "/auth/register", "/auth/login", "/public/**", "/api/public/**", "/auth/internal/**", "/api/auth/internal/**").permitAll()
                .requestMatchers("/api/products/**", "/api/products").permitAll() // Cho phép xem sản phẩm mà không cần đăng nhập
                .requestMatchers("/api/health", "/health").permitAll() // Health check endpoint
                .requestMatchers("/", "/index.html", "/assets/**", "/error", "/favicon.ico").permitAll() // Cho phép truy cập static files và error page
                .requestMatchers(request -> {
                    String method = request.getMethod();
                    // Cho phép OPTIONS request (CORS preflight)
                    if ("OPTIONS".equalsIgnoreCase(method)) {
                        return true;
                    }
                    String path = request.getRequestURI();
                    // Cho phép các file static (HTML, JS, CSS, images, fonts)
                    return path.endsWith(".html") || 
                           path.endsWith(".js") || 
                           path.endsWith(".css") || 
                           path.endsWith(".png") || 
                           path.endsWith(".jpg") || 
                           path.endsWith(".jpeg") || 
                           path.endsWith(".gif") || 
                           path.endsWith(".svg") || 
                           path.endsWith(".ico") || 
                           path.endsWith(".woff") || 
                           path.endsWith(".woff2") || 
                           path.endsWith(".ttf") || 
                           path.endsWith(".eot");
                }).permitAll()
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
} 