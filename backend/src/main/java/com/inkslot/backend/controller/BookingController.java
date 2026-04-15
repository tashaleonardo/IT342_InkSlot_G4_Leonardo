package com.inkslot.backend.controller;

import com.inkslot.backend.dto.request.StatusUpdateRequest;
import com.inkslot.backend.dto.response.ApiResponse;
import com.inkslot.backend.dto.response.BookingResponse;
import com.inkslot.backend.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/artist/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getMyBookings(
            @RequestParam(required = false) String status) {
        String email = getEmail();
        return ResponseEntity.ok(ApiResponse.success(
            bookingService.getArtistBookings(email, status)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BookingResponse>> getBooking(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(
            bookingService.getBookingById(id, getEmail())));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<BookingResponse>> updateStatus(
            @PathVariable Long id, @RequestBody StatusUpdateRequest req) {
        return ResponseEntity.ok(ApiResponse.success(
            bookingService.updateStatus(id, getEmail(), req)));
    }

    private String getEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth.getName();
    }
}
