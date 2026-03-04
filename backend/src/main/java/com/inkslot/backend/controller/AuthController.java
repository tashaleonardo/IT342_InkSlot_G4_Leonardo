package com.inkslot.backend.controller;

import com.inkslot.backend.dto.request.LoginRequest;
import com.inkslot.backend.dto.request.RegisterRequest;
import com.inkslot.backend.dto.response.ApiResponse;
import com.inkslot.backend.dto.response.AuthResponse;
import com.inkslot.backend.dto.response.UserResponse;
import com.inkslot.backend.entity.ArtistProfile;
import com.inkslot.backend.entity.User;
import com.inkslot.backend.repository.ArtistProfileRepository;
import com.inkslot.backend.service.AuthService;
import com.inkslot.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserService userService;
    private final ArtistProfileRepository artistProfileRepository;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        User user = userService.getUserByEmail(email);
        ArtistProfile profile = artistProfileRepository.findByUserId(user.getId()).orElse(null);

        UserResponse userResponse = new UserResponse();
        userResponse.setId(user.getId());
        userResponse.setEmail(user.getEmail());
        userResponse.setFullName(user.getFullName());
        userResponse.setRole(user.getRole());

        if (profile != null) {
            userResponse.setProfileImageUrl(profile.getProfileImageUrl());
            userResponse.setBio(profile.getBio());
        }

        return ResponseEntity.ok(ApiResponse.success(userResponse));
    }
}
