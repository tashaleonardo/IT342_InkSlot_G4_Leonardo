package com.inkslot.backend.features.auth;

import com.inkslot.backend.features.user.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.Collection;
import java.util.List;
import java.util.Map;

/**
 * Adapter Pattern: bridges the incompatible OAuth2User (Google) and
 * UserDetails (Spring Security) interfaces without modifying either.
 *
 * Target:  UserDetails  (what Spring Security's JWT filter expects)
 * Adaptee: OAuth2User   (what Google provides)
 */
public class OAuth2UserAdapter implements UserDetails, OAuth2User {

    private final OAuth2User oauth2User;   // Adaptee (wrapped)
    private final User user;               // InkSlot domain entity

    public OAuth2UserAdapter(OAuth2User oauth2User, User user) {
        this.oauth2User = oauth2User;
        this.user = user;
    }

    // --- UserDetails methods (Target interface) ---

    @Override
    public String getUsername() {
        return user.getEmail();            // translates OAuth2User.getName() → email
    }

    @Override
    public String getPassword() {
        return user.getPasswordHash() != null ? user.getPasswordHash() : "";
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole()));
    }

    @Override public boolean isAccountNonExpired()    { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isAccountNonLocked()     { return user.getIsActive(); }
    @Override public boolean isEnabled()              { return user.getIsActive(); }

    // --- OAuth2User methods (Adaptee delegation) ---

    @Override
    public Map<String, Object> getAttributes() {
        return oauth2User.getAttributes(); // delegates to the wrapped OAuth2User
    }

    @Override
    public String getName() {
        return oauth2User.getName();
    }

    public User getUser() {
        return user;
    }
}
