package com.inkslot.backend.features.booking;

import lombok.Data;

@Data
public class StatusUpdateRequest {
    private String status;             // CONFIRMED | COMPLETED | CANCELLED
    private String cancellationReason; // required when status = CANCELLED
}
