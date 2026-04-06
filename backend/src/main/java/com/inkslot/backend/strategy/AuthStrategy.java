package com.inkslot.backend.strategy;

import com.inkslot.backend.dto.request.LoginRequest;
import com.inkslot.backend.dto.response.AuthResponse;

public interface AuthStrategy {
    AuthResponse authenticate(LoginRequest request);
    boolean supports(String authType);
}