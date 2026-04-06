package com.inkslot.backend.factory;

import com.inkslot.backend.dto.response.UserResponse;
import com.inkslot.backend.entity.ArtistProfile;
import com.inkslot.backend.entity.User;

public interface UserResponseFactory {
    UserResponse create(User user, ArtistProfile profile);
}