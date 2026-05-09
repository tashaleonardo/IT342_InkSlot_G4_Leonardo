package com.inkslot.backend.features.auth;

public interface AuthStrategy {
    boolean supports(String authType);
    AuthResponse authenticate(LoginRequest request);
}
