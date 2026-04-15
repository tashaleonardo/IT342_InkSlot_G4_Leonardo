package com.inkslot.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponse {
    private Long id;
    private String referenceNumber;
    private Long artistId;
    private String artistName;
    private String clientName;
    private String clientEmail;
    private String clientPhone;
    private LocalDate appointmentDate;
    private LocalTime appointmentTime;
    private String approximateSize;
    private Integer estimatedDurationMinutes;
    private String designPreference;
    private String additionalNotes;
    private String status;
    private String cancellationReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
