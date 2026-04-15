package com.inkslot.backend.controller;

import com.inkslot.backend.dto.request.BookingRequest;
import com.inkslot.backend.dto.response.ApiResponse;
import com.inkslot.backend.dto.response.BookingResponse;
import com.inkslot.backend.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/bookings")
@RequiredArgsConstructor
public class PublicBookingController {

    private final BookingService bookingService;

    @PostMapping
    public ResponseEntity<ApiResponse<BookingResponse>> createBooking(
            @Valid @RequestBody BookingRequest request) {
        BookingResponse response = bookingService.createBooking(request);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success(response));
    }

    @GetMapping("/status/{referenceNumber}")
    public ResponseEntity<ApiResponse<BookingResponse>> checkStatus(
            @PathVariable String referenceNumber) {
        return ResponseEntity.ok(ApiResponse.success(
            bookingService.getByReference(referenceNumber)));
    }
}
