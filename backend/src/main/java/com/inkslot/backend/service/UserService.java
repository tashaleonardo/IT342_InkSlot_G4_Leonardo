package com.inkslot.backend.service;

import com.inkslot.backend.dto.request.RegisterRequest;
import com.inkslot.backend.entity.User;
import com.inkslot.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {  // Remove "implements UserDetailsService"

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // Remove the loadUserByUsername method entirely

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
    }

    /**
     * Get all artists (users with role ARTIST)
     */
    public List<User> getAllArtists() {
        return userRepository.findByRole("ARTIST");
    }

    /**
     * Get user by ID
     */
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + id));
    }

    /**
     * Update artist status (activate/deactivate)
     */
    public User updateArtistStatus(Long id, Boolean isActive) {
        User artist = getUserById(id);
        artist.setIsActive(isActive);
        return userRepository.save(artist);
    }

    /**
     * Delete artist account
     */
    public void deleteArtist(Long id) {
        User artist = getUserById(id);
        userRepository.delete(artist);
    }

    /**
     * Update artist details
     */
    public User updateArtist(Long id, RegisterRequest request) {
        User artist = getUserById(id);
        
        // Parse full name from first and last name
        String fullName = request.getFullName();
        if (fullName != null && !fullName.isEmpty()) {
            artist.setFullName(fullName);
        }
        
        artist.setEmail(request.getEmail());
        
        // Update password if provided
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            artist.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        }
        
        return userRepository.save(artist);
    }
}