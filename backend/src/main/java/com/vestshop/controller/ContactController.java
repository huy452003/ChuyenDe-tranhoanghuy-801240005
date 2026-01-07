package com.vestshop.controller;

import com.vestshop.models.ContactMessageModel;
import com.vestshop.models.CreateContactMessageModel;
import com.vestshop.services.ContactService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/contact")
@CrossOrigin(origins = "http://localhost:3000")
@Validated
public class ContactController {

    @Autowired
    private ContactService contactService;

    @PostMapping("/messages")
    public ResponseEntity<ContactMessageModel> createContactMessage(
            @Valid @RequestBody CreateContactMessageModel createModel) {
        ContactMessageModel message = contactService.createContactMessage(createModel);
        return ResponseEntity.ok(message);
    }
}

