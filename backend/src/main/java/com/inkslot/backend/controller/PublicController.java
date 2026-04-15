package com.inkslot.backend.controller;

import com.inkslot.backend.dto.response.ApiResponse;
import com.inkslot.backend.entity.User;
import com.inkslot.backend.service.UserService;
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