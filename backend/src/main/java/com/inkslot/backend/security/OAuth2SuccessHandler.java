package com.inkslot.backend.security;

import com.inkslot.backend.entity.ArtistProfile;
import com.inkslot.backend.entity.User;
import com.inkslot.backend.repository.ArtistProfileRepository;
import com.inkslot.backend.repository.UserRepository;
import com.inkslot.backend.service.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
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

    private static final String FRONTEND_URL = "http://localhost:5173";

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String email    = oAuth2User.getAttribute("email");
        String name     = oAuth2User.getAttribute("name");
        String googleId = oAuth2User.getAttribute("sub");

        log.info("OAuth2 success for: {}", email);

        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            user = new User();
            user.setEmail(email);
            user.setFullName(name);
            user.setGoogleId(googleId);
            user.setRole("ARTIST");
            user.setIsActive(true);
            user = userRepository.save(user);

            ArtistProfile profile = new ArtistProfile();
            profile.setUser(user);
            artistProfileRepository.save(profile);

            log.info("New artist created via Google OAuth: {}", email);
        } else if (user.getGoogleId() == null) {
            user.setGoogleId(googleId);
            userRepository.save(user);
            log.info("Linked Google ID to existing user: {}", email);
        }

        // Adapter Pattern: wrap OAuth2User + User entity into a UserDetails-compatible adapter
        // This bridges Google's OAuth2User interface with Spring Security's UserDetails,
        // allowing jwtService.generateToken() to work without an extra DB lookup.
        OAuth2UserAdapter adapter = new OAuth2UserAdapter(oAuth2User, user);

        String accessToken  = jwtService.generateToken(adapter);
        String refreshToken = jwtService.generateRefreshToken(adapter);

        String redirectUrl = UriComponentsBuilder
                .fromUriString(FRONTEND_URL + "/oauth2/callback")
                .queryParam("token", accessToken)
                .queryParam("refreshToken", refreshToken)
                .queryParam("role", user.getRole())
                .build().toUriString();

        log.info("Redirecting to: {}", redirectUrl);
        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}