/**
 * Utility functions để tính tuổi từ ngày sinh
 */

/**
 * Tính tuổi từ ngày sinh
 * @param {string} birthDate - Ngày sinh dạng "YYYY-MM-DD" hoặc "DD-MM-YYYY"
 * @returns {number|null} Tuổi hiện tại, hoặc null nếu không hợp lệ
 */
export function calculateAge(birthDate) {
  if (!birthDate) return null;
  
  try {
    // Parse date - có thể là "YYYY-MM-DD" hoặc "DD-MM-YYYY"
    let date;
    if (birthDate.includes('-')) {
      const parts = birthDate.split('-');
      if (parts[0].length === 4) {
        // Format: YYYY-MM-DD
        date = new Date(birthDate);
      } else {
        // Format: DD-MM-YYYY
        date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
      }
    } else {
      date = new Date(birthDate);
    }
    
    if (isNaN(date.getTime())) return null;
    
    const today = new Date();
    let age = today.getFullYear() - date.getFullYear();
    const monthDiff = today.getMonth() - date.getMonth();
    
    // Nếu chưa đến sinh nhật trong năm nay, giảm 1 tuổi
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
      age--;
    }
    
    return age >= 0 ? age : null;
  } catch (error) {
    return null;
  }
}

/**
 * Kiểm tra tuổi có đủ 16 tuổi không
 * @param {string} birthDate - Ngày sinh
 * @returns {boolean} true nếu đủ 16 tuổi
 */
export function isAgeValid(birthDate) {
  const age = calculateAge(birthDate);
  return age !== null && age >= 16;
}

