package com.inkslot.backend.features.auth;

import com.inkslot.backend.features.artist.ArtistProfile;
import com.inkslot.backend.features.user.User;
import com.inkslot.backend.features.user.UserResponse;

public interface UserResponseFactory {
    UserResponse create(User user, ArtistProfile profile);
}
