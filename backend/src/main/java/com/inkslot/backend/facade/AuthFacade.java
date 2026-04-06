package com.inkslot.backend.facade;

import com.inkslot.backend.dto.response.UserResponse;
import com.inkslot.backend.entity.ArtistProfile;
import com.inkslot.backend.entity.User;
import com.inkslot.backend.factory.UserResponseFactory;
import com.inkslot.backend.repository.ArtistProfileRepository;
import com.inkslot.backend.service.UserService;
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