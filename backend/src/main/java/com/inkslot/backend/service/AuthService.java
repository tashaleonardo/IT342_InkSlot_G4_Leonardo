package com.inkslot.backend.service;

import com.inkslot.backend.dto.request.LoginRequest;
import com.inkslot.backend.dto.request.RegisterRequest;
import com.inkslot.backend.dto.response.AuthResponse;
import com.inkslot.backend.entity.ArtistProfile;
import com.inkslot.backend.entity.User;
import com.inkslot.backend.event.UserRegisteredEvent;
import com.inkslot.backend.exception.DuplicateEmailException;
import com.inkslot.backend.factory.UserResponseFactory;
import com.inkslot.backend.repository.ArtistProfileRepository;
import com.inkslot.backend.repository.UserRepository;
import com.inkslot.backend.strategy.AuthStrategy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final ArtistProfileRepository artistProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final CustomUserDetailsService customUserDetailsService;

    // Factory Method Pattern: builds UserResponse objects
    private final UserResponseFactory userResponseFactory;

    // Observer Pattern: publishes domain events
    private final ApplicationEventPublisher eventPublisher;

    // Strategy Pattern: Spring injects all AuthStrategy implementations
    private final List<AuthStrategy> authStrategies;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        log.info("Registering user: {}", request.getEmail());

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateEmailException("Email already registered");
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());
        user.setRole(request.getRole() != null ? request.getRole() : "ARTIST");
        user.setIsActive(true);

        User savedUser = userRepository.save(user);
        log.info("User saved with id: {}", savedUser.getId());

        ArtistProfile artistProfile = new ArtistProfile();
        artistProfile.setUser(savedUser);
        ArtistProfile savedProfile = artistProfileRepository.save(artistProfile);

        // Observer Pattern: notify all listeners — UserRegistrationListener reacts
        eventPublisher.publishEvent(new UserRegisteredEvent(this, savedUser));

        UserDetails userDetails = customUserDetailsService.loadUserByUsername(savedUser.getEmail());
        String accessToken  = jwtService.generateToken(userDetails);
        String refreshToken = jwtService.generateRefreshToken(userDetails);

        // Factory Method Pattern: create UserResponse via factory
        return new AuthResponse(userResponseFactory.create(savedUser, savedProfile), accessToken, refreshToken);
    }

    /**
     * Strategy Pattern (Context):
     * Delegates to whichever AuthStrategy supports "EMAIL_PASSWORD".
     * Adding a new auth method only requires a new AuthStrategy @Component — no changes here.
     */
    public AuthResponse login(LoginRequest request) {
        return authStrategies.stream()
                .filter(s -> s.supports("EMAIL_PASSWORD"))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("No strategy found for EMAIL_PASSWORD"))
                .authenticate(request);
    }
}