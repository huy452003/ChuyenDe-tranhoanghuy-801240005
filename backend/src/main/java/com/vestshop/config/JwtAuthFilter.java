package com.vestshop.config;

import com.vestshop.services.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {
    @Autowired
    JwtService jwtService;
    @Autowired
    UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {
        
        String authHeader = request.getHeader("Authorization");
        String jwt;
        String username;
        String method = request.getMethod();
        String uri = request.getRequestURI();
                
        // nếu là public endpoint thì skip jwt validation,
        // vì JwtAuthFilter chạy trước nên xử lý thêm ở đây sẽ hiệu quả hơn
        if (isPublicEndpoint(uri, method)) {
             filterChain.doFilter(request, response);
             return;
        }

        // Nếu không có Authorization header, để SecurityConfig xử lý (không throw exception)
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            jwt = authHeader.substring(7); // bỏ "Bearer " để lấy token từ header
            username = jwtService.extractUsername(jwt); // lấy username từ token

            // kiểm tra username có tồn tại không, và đã authentication chưa để tránh lặp lại
            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null){
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(username); // lấy user details từ database
                if(jwtService.isTokenValid(jwt, userDetails)) { // kiểm tra username có tồn tại không, và token còn hạn sử dụng không
                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities()
                    );

                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    // set authentication vào security context
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                } else {
                    // Token không hợp lệ - trả về 401 Unauthorized
                    SecurityContextHolder.clearContext();
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"message\":\"Invalid or expired JWT token\",\"error\":\"Unauthorized\"}");
                    return;
                }
            }
        } catch (Exception e) {
            // Clear security context nếu có lỗi
            SecurityContextHolder.clearContext();
            
            // Token không hợp lệ hoặc đã hết hạn - trả về 401 Unauthorized
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"message\":\"Token may be invalid, expired, or malformed\",\"error\":\"Unauthorized\"}");
            return;
        }
        filterChain.doFilter(request, response);
    }

    // Kiểm tra xem endpoint có phải là public không
    private boolean isPublicEndpoint(String uri, String method) {
        // Check với và không có /api prefix
        if (uri.equals("/auth/register") || 
            uri.equals("/auth/login") ||
            uri.equals("/api/auth/register") || 
            uri.equals("/api/auth/login") ||
            uri.startsWith("/public/") ||
            uri.startsWith("/api/public/") ||
            uri.startsWith("/auth/internal/") ||
            uri.startsWith("/api/auth/internal/")) {
            return true;
        }
        
        // Skip static files (HTML, JS, CSS, images, fonts, etc.)
        if (uri.equals("/") || 
            uri.equals("/index.html") ||
            uri.endsWith(".html") ||
            uri.endsWith(".js") ||
            uri.endsWith(".css") ||
            uri.endsWith(".png") ||
            uri.endsWith(".jpg") ||
            uri.endsWith(".jpeg") ||
            uri.endsWith(".gif") ||
            uri.endsWith(".svg") ||
            uri.endsWith(".ico") ||
            uri.endsWith(".woff") ||
            uri.endsWith(".woff2") ||
            uri.endsWith(".ttf") ||
            uri.endsWith(".eot") ||
            uri.startsWith("/assets/")) {
            return true;
        }
        
        // Chỉ cho phép GET products và GET reviews công khai
        // POST/PUT/DELETE reviews cần authentication
        if ("GET".equalsIgnoreCase(method)) {
            if (uri.startsWith("/api/products") && !uri.contains("/reviews")) {
                return true; // GET /api/products và GET /api/products/{id}
            }
            if (uri.startsWith("/api/products") && uri.contains("/reviews") && !uri.endsWith("/check")) {
                return true; // GET /api/products/{id}/reviews
            }
        }
        
        return false;
    }
}
