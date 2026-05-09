package com.inkslot.backend.features.booking;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class BookingRequest {

    @NotNull(message = "Artist ID is required")
    private Long artistId;

    @NotBlank(message = "Client name is required")
    @Size(max = 150, message = "Name must not exceed 150 characters")
    private String clientName;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String clientEmail;

    @NotBlank(message = "Phone number is required")
    private String clientPhone;

    @NotNull(message = "Appointment date is required")
    private String appointmentDate;   // YYYY-MM-DD

    @NotBlank(message = "Appointment time is required")
    private String appointmentTime;   // HH:mm

    @NotBlank(message = "Tattoo size is required")
    private String approximateSize;   // SMALL | MEDIUM | LARGE | UNDECIDED

    private String designPreference;
    private String additionalNotes;
}
