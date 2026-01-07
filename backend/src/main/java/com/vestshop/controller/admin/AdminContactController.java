package com.vestshop.controller.admin;

import com.vestshop.models.ContactMessageModel;
import com.vestshop.services.ContactService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/admin/contact")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminContactController {

    @Autowired
    private ContactService contactService;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/messages")
    public ResponseEntity<List<ContactMessageModel>> getAllMessages() {
        List<ContactMessageModel> messages = contactService.getAllMessages();
        return ResponseEntity.ok(messages);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/messages/{id}")
    public ResponseEntity<ContactMessageModel> getMessageById(@PathVariable Long id) {
        ContactMessageModel message = contactService.getMessageById(id);
        return ResponseEntity.ok(message);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/messages/{id}/read")
    public ResponseEntity<ContactMessageModel> markAsRead(@PathVariable Long id) {
        ContactMessageModel message = contactService.markAsRead(id);
        return ResponseEntity.ok(message);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/messages/unread/count")
    public ResponseEntity<Map<String, Long>> getUnreadCount() {
        Long count = contactService.getUnreadCount();
        Map<String, Long> response = new HashMap<>();
        response.put("unreadCount", count);
        return ResponseEntity.ok(response);
    }
}

