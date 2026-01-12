package com.vestshop.controller.admin;

import com.vestshop.models.ContactMessageModel;
import com.vestshop.services.ContactService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/admin/contact")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminContactController {

    @Autowired
    private ContactService contactService;

    // Lấy danh sách tin nhắn liên hệ
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/messages")
    public ResponseEntity<?> getAllMessages(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size
    ) {
        // Nếu có page hoặc size, trả về paginated response
        if (page != null || size != null) {
            int pageNum = page != null ? page : 0;
            int pageSize = size != null ? size : 10;
            return ResponseEntity.ok(contactService.getAllMessagesPaginated(pageNum, pageSize));
        }
        // Nếu không có pagination params, trả về list như cũ
        return ResponseEntity.ok(contactService.getAllMessages());
    }

    // Lấy tin nhắn liên hệ theo ID
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/messages/{id}")
    public ResponseEntity<ContactMessageModel> getMessageById(@PathVariable Integer id) {
        ContactMessageModel message = contactService.getMessageById(id);
        return ResponseEntity.ok(message);
    }

    // Đánh dấu tin nhắn liên hệ đã đọc
    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/messages/{id}/read")
    public ResponseEntity<ContactMessageModel> markAsRead(@PathVariable Integer id) {
        ContactMessageModel message = contactService.markAsRead(id);
        return ResponseEntity.ok(message);
    }

    // Lấy số lượng tin nhắn liên hệ chưa đọc
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/messages/unread/count")
    public ResponseEntity<Map<String, Integer>> getUnreadCount() {
        Integer count = contactService.getUnreadCount();
        Map<String, Integer> response = new HashMap<>();
        response.put("unreadCount", count);
        return ResponseEntity.ok(response);
    }
}

