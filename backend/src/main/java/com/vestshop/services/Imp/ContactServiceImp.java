package com.vestshop.services.Imp;

import com.vestshop.entity.ContactMessage;
import com.vestshop.models.ContactMessageModel;
import com.vestshop.models.CreateContactMessageModel;
import com.vestshop.repository.ContactMessageRepository;
import com.vestshop.services.ContactService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.modelmapper.ModelMapper;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ContactServiceImp implements ContactService {

    @Autowired
    private ContactMessageRepository contactMessageRepository;

    @Autowired
    private ModelMapper modelMapper;

    @Override
    public ContactMessageModel createContactMessage(CreateContactMessageModel createModel) {
        ContactMessage message = ContactMessage.builder()
                .name(createModel.getName())
                .email(createModel.getEmail())
                .phone(createModel.getPhone())
                .subject(createModel.getSubject())
                .message(createModel.getMessage())
                .isRead(false)
                .build();
        
        ContactMessage saved = contactMessageRepository.save(message);
        return convertToModel(saved);
    }

    @Override
    public List<ContactMessageModel> getAllMessages() {
        return contactMessageRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::convertToModel)
                .collect(Collectors.toList());
    }

    @Override
    public ContactMessageModel getMessageById(Long id) {
        ContactMessage message = contactMessageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contact message not found"));
        return convertToModel(message);
    }

    @Override
    public ContactMessageModel markAsRead(Long id) {
        ContactMessage message = contactMessageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contact message not found"));
        message.setIsRead(true);
        ContactMessage updated = contactMessageRepository.save(message);
        return convertToModel(updated);
    }

    @Override
    public Long getUnreadCount() {
        return contactMessageRepository.countByIsReadFalse();
    }

    private ContactMessageModel convertToModel(ContactMessage message) {
        return modelMapper.map(message, ContactMessageModel.class);
    }
}

