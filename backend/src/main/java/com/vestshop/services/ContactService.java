package com.vestshop.services;

import com.vestshop.models.ContactMessageModel;
import com.vestshop.models.PageResponseModel;
import com.vestshop.models.CreateContactMessageModel;

import java.util.List;

public interface ContactService {
    // Tạo tin nhắn liên hệ
    ContactMessageModel createContactMessage(CreateContactMessageModel createModel);
    // Lấy tất cả tin nhắn liên hệ
    List<ContactMessageModel> getAllMessages();
    // Lấy tin nhắn liên hệ theo id
    ContactMessageModel getMessageById(Integer id);
    // Đánh dấu tin nhắn liên hệ đã đọc
    ContactMessageModel markAsRead(Integer id);
    // Lấy số lượng tin nhắn liên hệ chưa đọc
    Integer getUnreadCount();
    // Lấy danh sách messages có phân trang (cho admin)
    PageResponseModel<ContactMessageModel> getAllMessagesPaginated(int page, int size);
}

