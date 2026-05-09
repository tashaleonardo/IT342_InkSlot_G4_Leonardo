package com.inkslot.backend.features.admin;

import com.inkslot.backend.features.auth.AuthService;
import com.inkslot.backend.features.auth.AuthResponse;
import com.inkslot.backend.features.auth.RegisterRequest;
import com.inkslot.backend.features.user.User;
import com.inkslot.backend.features.user.UserService;
import com.inkslot.backend.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserService userService;
    private final AuthService authService;

    /**
     * Create a new artist account (Admin only)
     */
    @PostMapping("/artists")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AuthResponse>> createArtist(
            @Valid @RequestBody RegisterRequest request) {

        // Force role to be ARTIST for security
        request.setRole("ARTIST");

        AuthResponse response = authService.register(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(response));
    }

    /**
     * Get all artists (Admin only)
     */
    @GetMapping("/artists")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<User>>> getAllArtists() {
        List<User> artists = userService.getAllArtists();
        return ResponseEntity.ok(ApiResponse.success(artists));
    }

    /**
     * Update artist status (activate/deactivate)
     */
    @PatchMapping("/artists/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<User>> updateArtistStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> statusUpdate) {

        Boolean isActive = statusUpdate.get("isActive");
        User updatedArtist = userService.updateArtistStatus(id, isActive);
        return ResponseEntity.ok(ApiResponse.success(updatedArtist));
    }

    /**
     * Delete an artist account
     */
    @DeleteMapping("/artists/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteArtist(@PathVariable Long id) {
        userService.deleteArtist(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    /**
     * Get artist by ID
     */
    @GetMapping("/artists/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<User>> getArtistById(@PathVariable Long id) {
        User artist = userService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success(artist));
    }

    /**
     * Update artist details
     */
    @PutMapping("/artists/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<User>> updateArtist(
            @PathVariable Long id,
            @Valid @RequestBody RegisterRequest request) {

        User updatedArtist = userService.updateArtist(id, request);
        return ResponseEntity.ok(ApiResponse.success(updatedArtist));
    }
}
