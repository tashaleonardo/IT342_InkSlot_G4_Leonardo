package com.inkslot.backend.features.auth;

import com.inkslot.backend.features.artist.ArtistProfile;
import com.inkslot.backend.features.artist.ArtistProfileRepository;
import com.inkslot.backend.features.user.User;
import com.inkslot.backend.features.user.UserResponse;
import com.inkslot.backend.features.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AuthFacade {

    private final UserService userService;
    private final ArtistProfileRepository artistProfileRepository;
    private final UserResponseFactory userResponseFactory;

    /**
     * Facade: hides the complexity of fetching user + profile + building response
     * behind a single clean method call.
     */
    public UserResponse getCurrentUserProfile(String email) {
        User user = userService.getUserByEmail(email);
        ArtistProfile profile = artistProfileRepository.findByUserId(user.getId()).orElse(null);
        return userResponseFactory.create(user, profile);
    }
}
