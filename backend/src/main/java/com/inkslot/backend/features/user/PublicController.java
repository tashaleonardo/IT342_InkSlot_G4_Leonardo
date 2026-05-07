package com.inkslot.backend.features.user;

import com.inkslot.backend.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class PublicController {

    private final UserService userService;

    @GetMapping("/artists")
    public ResponseEntity<ApiResponse<List<User>>> getAllArtists() {
        List<User> artists = userService.getAllArtists();
        return ResponseEntity.ok(ApiResponse.success(artists));
    }
}
