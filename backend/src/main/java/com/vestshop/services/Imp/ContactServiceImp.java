package com.vestshop.services.Imp;

import com.vestshop.entity.ContactMessage;
import com.vestshop.models.ContactMessageModel;
import com.vestshop.models.CreateContactMessageModel;
import com.vestshop.repository.ContactMessageRepository;
import com.vestshop.services.ContactService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.modelmapper.ModelMapper;

import java.util.List;
import java.util.stream.Collectors;
import com.vestshop.models.PageResponseModel;

@Service
public class ContactServiceImp implements ContactService {

    @Autowired
    private ContactMessageRepository contactMessageRepository;

    @Autowired
    private ModelMapper modelMapper;

    // Tạo tin nhắn liên hệ mới
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

    // Lấy tất cả tin nhắn liên hệ
    @Override
    public List<ContactMessageModel> getAllMessages() {
        return contactMessageRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::convertToModel)
                .collect(Collectors.toList());
    }

    // Lấy tin nhắn liên hệ theo ID
    @Override
    public ContactMessageModel getMessageById(Integer id) {
        ContactMessage message = contactMessageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contact message not found"));
        return convertToModel(message);
    }

    // Đánh dấu tin nhắn liên hệ đã đọc
    @Override
    public ContactMessageModel markAsRead(Integer id) {
        ContactMessage message = contactMessageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contact message not found"));
        message.setIsRead(true);
        ContactMessage updated = contactMessageRepository.save(message);
        return convertToModel(updated);
    }

    // Đếm số lượng tin nhắn liên hệ chưa đọc
    @Override
    public Integer getUnreadCount() {
        return contactMessageRepository.countByIsReadFalse().intValue();
    }

    // Chuyển đổi tin nhắn liên hệ từ entity sang model
    private ContactMessageModel convertToModel(ContactMessage message) {
        return modelMapper.map(message, ContactMessageModel.class);
    }
    
    // Lấy tất cả tin nhắn liên hệ có phân trang
    @Override
    public PageResponseModel<ContactMessageModel> getAllMessagesPaginated(int page, int size) {
        // Kiểm tra page và size
        if (page < 0) page = 0;
        if (size < 1) size = 10; // Kích thước mặc định là 10
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<ContactMessage> messagePage = contactMessageRepository.findAll(pageable);
        
        // Chuyển đổi sang ContactMessageModel
        List<ContactMessageModel> content = messagePage.getContent().stream()
            .map(message -> convertToModel(message))
            .collect(Collectors.toList());
        
        // Tạo PageResponse
        PageResponseModel<ContactMessageModel> response = new PageResponseModel<>();
        response.setContent(content);
        response.setPage(messagePage.getNumber());
        response.setSize(messagePage.getSize());
        response.setTotalElements(messagePage.getTotalElements());
        response.setTotalPages(messagePage.getTotalPages());
        response.setFirst(messagePage.isFirst());
        response.setLast(messagePage.isLast());
        
        return response;
    }
}

