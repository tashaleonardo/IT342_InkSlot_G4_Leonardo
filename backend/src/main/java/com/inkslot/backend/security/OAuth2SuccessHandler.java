package com.inkslot.backend.security;

import com.inkslot.backend.entity.ArtistProfile;
import com.inkslot.backend.entity.User;
import com.inkslot.backend.repository.ArtistProfileRepository;
import com.inkslot.backend.repository.UserRepository;
import com.inkslot.backend.service.CustomUserDetailsService;
import com.inkslot.backend.service.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Component
@RequiredArgsConstructor
@Slf4j
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final ArtistProfileRepository artistProfileRepository;
    private final JwtService jwtService;
    private final CustomUserDetailsService customUserDetailsService;

    // Frontend URL to redirect to after successful OAuth login
    private static final String FRONTEND_URL = "http://localhost:5173";

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String googleId = oAuth2User.getAttribute("sub");

        log.info("OAuth2 login success for email: {}", email);

        // Find existing user or create new one
        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            // New user — create account
            user = new User();
            user.setEmail(email);
            user.setFullName(name);
            user.setGoogleId(googleId);
            user.setRole("ARTIST");
            user.setIsActive(true);
            // No password for OAuth users
            user = userRepository.save(user);

            // Create empty artist profile
            ArtistProfile artistProfile = new ArtistProfile();
            artistProfile.setUser(user);
            artistProfileRepository.save(artistProfile);

            log.info("New artist created via Google OAuth: {}", email);
        } else {
            // Existing user — link Google ID if not already linked
            if (user.getGoogleId() == null) {
                user.setGoogleId(googleId);
                userRepository.save(user);
                log.info("Linked Google account to existing user: {}", email);
            }
        }

        // Generate JWT
        UserDetails userDetails = customUserDetailsService.loadUserByUsername(email);
        String accessToken = jwtService.generateToken(userDetails);
        String refreshToken = jwtService.generateRefreshToken(userDetails);

        // Redirect to frontend with tokens as query params
        String role = user.getRole();
        String redirectUrl = UriComponentsBuilder
                .fromUriString(FRONTEND_URL + "/oauth2/callback")
                .queryParam("token", accessToken)
                .queryParam("refreshToken", refreshToken)
                .queryParam("role", role)
                .build().toUriString();

        log.info("Redirecting to frontend: {}", redirectUrl);
        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}