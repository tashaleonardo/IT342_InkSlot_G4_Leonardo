package com.inkslot.backend;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class TestPasswordHash {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(10);
        
        // Generate fresh hashes
        String adminHash = encoder.encode("admin123");
        String natashaHash = encoder.encode("pass123456");
        
        System.out.println("admin123 hash: " + adminHash);
        System.out.println("pass123456 hash: " + natashaHash);
        
        // Verify the existing admin hash
        String existingAdminHash = "$2a$10$rEWKHxvM4kqGz.BqLbWoyeOyZqvN6nR9CqSzF4mYvLKzJdPzTqG8C";
        boolean matches = encoder.matches("admin123", existingAdminHash);
        System.out.println("\nDoes existing admin hash match 'admin123'? " + matches);
        
        if (!matches) {
            System.out.println("\nThe existing hash is NOT for 'admin123'!");
            System.out.println("Use this SQL to update:");
            System.out.println("UPDATE users SET password_hash = '" + adminHash + "' WHERE email = 'admin@inkslot.ph';");
        }
    }
}
