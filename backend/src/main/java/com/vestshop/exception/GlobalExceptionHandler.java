package com.vestshop.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // Xử lý lỗi validation
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, Object> errors = new HashMap<>();
        Map<String, String> fieldErrors = new HashMap<>();
        
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            fieldErrors.put(fieldName, errorMessage);
        });
        
        errors.put("message", "Dữ liệu không hợp lệ");
        errors.put("errors", fieldErrors);
        
        // Lấy lỗi đầu tiên để hiển thị
        if (!fieldErrors.isEmpty()) {
            String firstError = fieldErrors.values().iterator().next();
            errors.put("message", firstError);
        }
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errors);
    }

    // Xử lý lỗi xác thực (sai mật khẩu, tài khoản không tồn tại)
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Map<String, Object>> handleBadCredentialsException(BadCredentialsException ex) {
        Map<String, Object> error = new HashMap<>();
        error.put("message", "Tên đăng nhập hoặc mật khẩu không đúng");
        error.put("error", "BadCredentialsException");
        
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }

    // Xử lý các lỗi xác thực khác
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<Map<String, Object>> handleAuthenticationException(AuthenticationException ex) {
        Map<String, Object> error = new HashMap<>();
        String message = ex.getMessage();
        
        // Chuyển đổi thông báo lỗi sang tiếng Việt
        if (message != null && message.contains("Bad credentials")) {
            error.put("message", "Tên đăng nhập hoặc mật khẩu không đúng");
        } else if (message != null && message.contains("User not found")) {
            error.put("message", "Tài khoản không tồn tại");
        } else {
            error.put("message", "Xác thực thất bại. Vui lòng kiểm tra lại thông tin đăng nhập");
        }
        
        error.put("error", "AuthenticationException");
        
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }

    // Xử lý lỗi runtime
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntimeException(RuntimeException ex) {
        Map<String, Object> error = new HashMap<>();
        String message = ex.getMessage();
        
        // Chuyển đổi các thông báo lỗi phổ biến sang tiếng Việt
        if (message != null) {
            // Đã có một số message bằng tiếng Việt rồi, giữ nguyên
            // Chỉ chuyển đổi các message tiếng Anh
            if (message.contains("User not found")) {
                message = "Tài khoản không tồn tại";
            } else if (message.contains("Account disabled")) {
                message = "Tài khoản đã bị vô hiệu hóa";
            } else if (message.contains("Username already exists")) {
                message = "Tên đăng nhập đã tồn tại";
            } else if (message.contains("Email already exists")) {
                message = "Email đã được sử dụng";
            } else if (message.contains("Phone number already exists")) {
                message = "Số điện thoại đã được sử dụng";
            } else if (message.contains("Only ADMIN")) {
                message = "Chỉ quản trị viên mới có quyền thực hiện thao tác này";
            } else if (message.contains("Only user can update")) {
                message = "Bạn chỉ có thể cập nhật thông tin của chính mình";
            } else if (message.contains("Password must be at least")) {
                message = "Mật khẩu phải có ít nhất 6 ký tự";
            } else if (message.contains("Username must be between")) {
                message = "Tên đăng nhập phải có từ 3 đến 50 ký tự";
            } else if (message.contains("Error extracting username")) {
                message = "Lỗi xác thực token. Vui lòng đăng nhập lại";
            }
        }
        
        error.put("message", message != null ? message : "Đã xảy ra lỗi");
        error.put("error", "RuntimeException");
        
        // Xác định HTTP status code phù hợp
        HttpStatus status = HttpStatus.INTERNAL_SERVER_ERROR;
        if (message != null) {
            if (message.contains("không tồn tại") || message.contains("không đúng")) {
                status = HttpStatus.NOT_FOUND;
            } else if (message.contains("đã tồn tại") || message.contains("đã được sử dụng")) {
                status = HttpStatus.CONFLICT;
            } else if (message.contains("không có quyền") || message.contains("chỉ có thể")) {
                status = HttpStatus.FORBIDDEN;
            } else if (message.contains("không hợp lệ") || message.contains("phải có")) {
                status = HttpStatus.BAD_REQUEST;
            }
        }
        
        return ResponseEntity.status(status).body(error);
    }

    // Xử lý lỗi tổng quát ( 500 Internal Server Error)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(Exception ex) {
        Map<String, Object> error = new HashMap<>();
        String message = ex.getMessage();
        
        error.put("message", message != null ? message : "Đã xảy ra lỗi không mong muốn");
        error.put("error", ex.getClass().getSimpleName());

        ex.printStackTrace();
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}

