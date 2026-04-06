package com.inkslot.backend.factory;

import com.inkslot.backend.dto.response.UserResponse;
import com.inkslot.backend.entity.ArtistProfile;
import com.inkslot.backend.entity.User;
import org.springframework.stereotype.Component;

@Component
public class StandardUserResponseFactory implements UserResponseFactory {

    @Override
    public UserResponse create(User user, ArtistProfile profile) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setEmail(user.getEmail());
        response.setFullName(user.getFullName());
        response.setRole(user.getRole());

        if (profile != null) {
            response.setProfileImageUrl(profile.getProfileImageUrl());
            response.setBio(profile.getBio());
        }

        return response;
    }
}