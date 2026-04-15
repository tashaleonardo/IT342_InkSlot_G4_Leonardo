package com.inkslot.backend.service;

import com.inkslot.backend.dto.request.BookingRequest;
import com.inkslot.backend.dto.request.StatusUpdateRequest;
import com.inkslot.backend.dto.response.BookingResponse;
import com.inkslot.backend.entity.Booking;
import com.inkslot.backend.entity.User;
import com.inkslot.backend.repository.BookingRepository;
import com.inkslot.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.Year;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

    // Duration map by size
    private Integer resolveDuration(String size) {
        return switch (size.toUpperCase()) {
            case "SMALL"     -> 90;
            case "MEDIUM"    -> 150;
            case "LARGE"     -> 240;
            default           -> null;
        };
    }

    // Generate reference: INK-2026-0001
    private String generateRef() {
        long count = bookingRepository.count() + 1;
        return String.format("INK-%d-%04d", Year.now().getValue(), count);
    }

    @Transactional
    public BookingResponse createBooking(BookingRequest req) {
        User artist = userRepository.findById(req.getArtistId())
            .orElseThrow(() -> new UsernameNotFoundException("Artist not found"));

        Booking booking = new Booking();
        booking.setReferenceNumber(generateRef());
        booking.setArtist(artist);
        booking.setClientName(req.getClientName());
        booking.setClientEmail(req.getClientEmail());
        booking.setClientPhone(req.getClientPhone());
        booking.setAppointmentDate(LocalDate.parse(req.getAppointmentDate()));
        booking.setAppointmentTime(LocalTime.parse(req.getAppointmentTime()));
        booking.setApproximateSize(req.getApproximateSize().toUpperCase());
        booking.setEstimatedDurationMinutes(resolveDuration(req.getApproximateSize()));
        booking.setDesignPreference(req.getDesignPreference());
        booking.setAdditionalNotes(req.getAdditionalNotes());
        booking.setStatus("PENDING");

        Booking saved = bookingRepository.save(booking);
        log.info("Booking created: {}", saved.getReferenceNumber());
        return toResponse(saved);
    }

    public List<BookingResponse> getArtistBookings(String email, String status) {
        User artist = userRepository.findByEmail(email)
            .orElseThrow(() -> new UsernameNotFoundException("Artist not found"));
        List<Booking> bookings = (status != null && !status.isBlank())
            ? bookingRepository.findByArtistIdAndStatusOrderByCreatedAtDesc(artist.getId(), status.toUpperCase())
            : bookingRepository.findByArtistIdOrderByCreatedAtDesc(artist.getId());
        return bookings.stream().map(this::toResponse).collect(Collectors.toList());
    }

    public BookingResponse getBookingById(Long id, String email) {
        Booking booking = bookingRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Booking not found"));
        if (!booking.getArtist().getEmail().equals(email)) {
            throw new RuntimeException("Forbidden");
        }
        return toResponse(booking);
    }

    public BookingResponse getByReference(String ref) {
        Booking booking = bookingRepository.findByReferenceNumber(ref)
            .orElseThrow(() -> new RuntimeException("Booking not found"));
        return toResponse(booking);
    }

    @Transactional
    public BookingResponse updateStatus(Long id, String email, StatusUpdateRequest req) {
        Booking booking = bookingRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Booking not found"));
        if (!booking.getArtist().getEmail().equals(email)) {
            throw new RuntimeException("Forbidden");
        }
        validateTransition(booking.getStatus(), req.getStatus());
        booking.setStatus(req.getStatus().toUpperCase());
        if (req.getCancellationReason() != null) {
            booking.setCancellationReason(req.getCancellationReason());
        }
        return toResponse(bookingRepository.save(booking));
    }

    private void validateTransition(String current, String next) {
        boolean valid = switch (current.toUpperCase()) {
            case "PENDING"   -> List.of("CONFIRMED","CANCELLED").contains(next.toUpperCase());
            case "CONFIRMED" -> List.of("COMPLETED","CANCELLED").contains(next.toUpperCase());
            default           -> false;
        };
        if (!valid) throw new RuntimeException(
            "Invalid status transition: " + current + " -> " + next);
    }

    private BookingResponse toResponse(Booking b) {
        return BookingResponse.builder()
            .id(b.getId())
            .referenceNumber(b.getReferenceNumber())
            .artistId(b.getArtist().getId())
            .artistName(b.getArtist().getFullName())
            .clientName(b.getClientName())
            .clientEmail(b.getClientEmail())
            .clientPhone(b.getClientPhone())
            .appointmentDate(b.getAppointmentDate())
            .appointmentTime(b.getAppointmentTime())
            .approximateSize(b.getApproximateSize())
            .estimatedDurationMinutes(b.getEstimatedDurationMinutes())
            .designPreference(b.getDesignPreference())
            .additionalNotes(b.getAdditionalNotes())
            .status(b.getStatus())
            .cancellationReason(b.getCancellationReason())
            .createdAt(b.getCreatedAt())
            .updatedAt(b.getUpdatedAt())
            .build();
    }
}
