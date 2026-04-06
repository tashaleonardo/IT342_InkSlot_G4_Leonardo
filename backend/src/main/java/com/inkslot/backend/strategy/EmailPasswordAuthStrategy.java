package com.inkslot.backend.strategy;

import com.inkslot.backend.dto.request.LoginRequest;
import com.inkslot.backend.dto.response.AuthResponse;
import com.inkslot.backend.entity.ArtistProfile;
import com.inkslot.backend.entity.User;
import com.inkslot.backend.exception.InvalidCredentialsException;
import com.inkslot.backend.factory.UserResponseFactory;
import com.inkslot.backend.repository.ArtistProfileRepository;
import com.inkslot.backend.repository.UserRepository;
import com.inkslot.backend.service.CustomUserDetailsService;
import com.inkslot.backend.service.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class EmailPasswordAuthStrategy implements AuthStrategy {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final ArtistProfileRepository artistProfileRepository;
    private final JwtService jwtService;
    private final CustomUserDetailsService customUserDetailsService;
    private final UserResponseFactory userResponseFactory;

    @Override
    public boolean supports(String authType) {
        return "EMAIL_PASSWORD".equals(authType);
    }

    @Override
    public AuthResponse authenticate(LoginRequest request) {
        log.info("[Strategy: EmailPassword] Authenticating: {}", request.getEmail());

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        } catch (BadCredentialsException e) {
            log.warn("[Strategy: EmailPassword] Bad credentials for: {}", request.getEmail());
            throw new InvalidCredentialsException("Invalid email or password");
        } catch (AuthenticationException e) {
            log.warn("[Strategy: EmailPassword] Auth failed: {}", e.getMessage());
            throw new InvalidCredentialsException("Authentication failed");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new InvalidCredentialsException("User not found"));

        if (!user.getIsActive()) {
            throw new InvalidCredentialsException("Account is inactive");
        }

        ArtistProfile profile = artistProfileRepository.findByUserId(user.getId()).orElse(null);

        UserDetails userDetails = customUserDetailsService.loadUserByUsername(user.getEmail());
        String accessToken  = jwtService.generateToken(userDetails);
        String refreshToken = jwtService.generateRefreshToken(userDetails);

        return new AuthResponse(userResponseFactory.create(user, profile), accessToken, refreshToken);
    }
}