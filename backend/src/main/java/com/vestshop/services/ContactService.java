package com.vestshop.services;

import com.vestshop.models.ContactMessageModel;
import com.vestshop.models.CreateContactMessageModel;

import java.util.List;

public interface ContactService {
    ContactMessageModel createContactMessage(CreateContactMessageModel createModel);
    List<ContactMessageModel> getAllMessages();
    ContactMessageModel getMessageById(Long id);
    ContactMessageModel markAsRead(Long id);
    Long getUnreadCount();
}

