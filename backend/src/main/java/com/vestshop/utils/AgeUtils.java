package com.vestshop.utils;

import java.time.LocalDate;
import java.time.Period;

/**
 * Utility class để tính tuổi từ ngày sinh
 */
public class AgeUtils {
    
    /**
     * Tính tuổi từ ngày sinh
     * @param birthDate Ngày sinh
     * @return Tuổi hiện tại, hoặc null nếu birthDate là null
     */
    public static Integer calculateAge(LocalDate birthDate) {
        if (birthDate == null) {
            return null;
        }
        return Period.between(birthDate, LocalDate.now()).getYears();
    }
    
    /**
     * Tính tuổi tại một thời điểm cụ thể
     * @param birthDate Ngày sinh
     * @param atDate Thời điểm cần tính tuổi
     * @return Tuổi tại thời điểm đó, hoặc null nếu birthDate là null
     */
    public static Integer calculateAgeAt(LocalDate birthDate, LocalDate atDate) {
        if (birthDate == null || atDate == null) {
            return null;
        }
        return Period.between(birthDate, atDate).getYears();
    }
}

