package com.vestshop.utils;

import java.time.LocalDate;
import java.time.Period;

public class AgeUtils {
    
    // Tính tuổi từ ngày sinh
    public static Integer calculateAge(LocalDate birthDate) {
        if (birthDate == null) {
            return null;
        }
        return Period.between(birthDate, LocalDate.now()).getYears();
    }
    
    // Tính tuổi tại một thời điểm cụ thể
    public static Integer calculateAgeAt(LocalDate birthDate, LocalDate atDate) {
        if (birthDate == null || atDate == null) {
            return null;
        }
        return Period.between(birthDate, atDate).getYears();
    }
}

