package com.inkslot.backend.dto.request;

import lombok.Data;

@Data
public class StatusUpdateRequest {
    private String status;             // CONFIRMED | COMPLETED | CANCELLED
    private String cancellationReason; // required when status = CANCELLED
}
