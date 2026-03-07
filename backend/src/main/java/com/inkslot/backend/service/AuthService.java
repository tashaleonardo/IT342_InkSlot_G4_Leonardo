package com.inkslot.backend.service;

import com.inkslot.backend.dto.request.LoginRequest;
import com.inkslot.backend.dto.request.RegisterRequest;
import com.inkslot.backend.dto.response.AuthResponse;
import com.inkslot.backend.dto.response.UserResponse;
import com.inkslot.backend.entity.ArtistProfile;
import com.inkslot.backend.entity.User;
import com.inkslot.backend.exception.DuplicateEmailException;
import com.inkslot.backend.exception.InvalidCredentialsException;
import com.inkslot.backend.repository.ArtistProfileRepository;
import com.inkslot.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final ArtistProfileRepository artistProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final CustomUserDetailsService customUserDetailsService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        log.info("Attempting to register user with email: {}", request.getEmail());
        
        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            log.warn("Registration failed - email already exists: {}", request.getEmail());
            throw new DuplicateEmailException("Email already registered");
        }

        // Create user
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());
        user.setRole(request.getRole() != null ? request.getRole() : "ARTIST");
        user.setIsActive(true);

        User savedUser = userRepository.save(user);
        log.info("User registered successfully with id: {}", savedUser.getId());

        // Create empty artist profile
        ArtistProfile artistProfile = new ArtistProfile();
        artistProfile.setUser(savedUser);
        artistProfileRepository.save(artistProfile);

        return buildAuthResponse(savedUser, artistProfile);
    }

    public AuthResponse login(LoginRequest request) {
        log.info("Login attempt for email: {}", request.getEmail());
        
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
            log.info("Authentication successful for email: {}", request.getEmail());
        } catch (BadCredentialsException e) {
            log.warn("Authentication failed for email: {} - Invalid credentials", request.getEmail());
            throw new InvalidCredentialsException("Invalid email or password");
        } catch (AuthenticationException e) {
            log.warn("Authentication failed: {}", e.getMessage());
            throw new InvalidCredentialsException("Authentication failed");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> {
                    log.warn("User not found after authentication: {}", request.getEmail());
                    return new InvalidCredentialsException("User not found");
                });

        if (!user.getIsActive()) {
            log.warn("Login failed - account is inactive for user: {}", request.getEmail());
            throw new InvalidCredentialsException("Account is inactive");
        }

        ArtistProfile artistProfile = artistProfileRepository.findByUserId(user.getId())
                .orElse(null);

        log.info("Login successful for user: {}", user.getEmail());

        return buildAuthResponse(user, artistProfile);
    }

    private AuthResponse buildAuthResponse(User user, ArtistProfile profile) {
        UserDetails userDetails = customUserDetailsService.loadUserByUsername(user.getEmail());
        String accessToken = jwtService.generateToken(userDetails);
        String refreshToken = jwtService.generateRefreshToken(userDetails);

        UserResponse userResponse = new UserResponse();
        userResponse.setId(user.getId());
        userResponse.setEmail(user.getEmail());
        userResponse.setFullName(user.getFullName());
        userResponse.setRole(user.getRole());

        if (profile != null) {
            userResponse.setProfileImageUrl(profile.getProfileImageUrl());
            userResponse.setBio(profile.getBio());
        }

        return new AuthResponse(userResponse, accessToken, refreshToken);
    }
}