package com.inkslot.backend.features.booking;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(locations = "classpath:application-test.properties")
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public class PublicBookingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private final String BOOKING_URL = "/api/v1/bookings";
    private Long seededArtistId;

    @BeforeAll
    void seedArtist() throws Exception {
        MvcResult result = mockMvc.perform(post("/api/v1/auth/register")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(Map.of(
                "fullName", "Booking Test Artist",
                "email", "booking.test.artist@inkslot.com",
                "password", "password123"
            ))))
            .andReturn();
        seededArtistId = objectMapper.readTree(result.getResponse().getContentAsString())
            .path("data").path("user").path("id").asLong();
    }

    private Map<String, Object> validBookingPayload() {
        Map<String, Object> body = new HashMap<>();
        body.put("clientName", "Juan dela Cruz");
        body.put("clientEmail", "juan@email.com");
        body.put("clientPhone", "09171234567");
        body.put("artistId", seededArtistId);
        body.put("appointmentDate", LocalDate.now().plusDays(7).toString());
        body.put("appointmentTime", "10:00");
        body.put("approximateSize", "MEDIUM");
        body.put("designPreference", "I have a reference image");
        return body;
    }

    // TC-BOOK-01: Valid booking
    @Test
    void TC_BOOK_01_validBooking_returns201WithReferenceNumber() throws Exception {
        mockMvc.perform(post(BOOKING_URL)
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(validBookingPayload())))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.data.referenceNumber").value(
                org.hamcrest.Matchers.startsWith("INK-")));
    }

    // TC-BOOK-02: Missing clientName
    @Test
    void TC_BOOK_02_missingClientName_returns400() throws Exception {
        Map<String, Object> body = validBookingPayload();
        body.remove("clientName");
        mockMvc.perform(post(BOOKING_URL)
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(body)))
            .andExpect(status().isBadRequest());
    }

    // TC-BOOK-03: Missing artistId
    @Test
    void TC_BOOK_03_missingArtistId_returns400() throws Exception {
        Map<String, Object> body = validBookingPayload();
        body.remove("artistId");
        mockMvc.perform(post(BOOKING_URL)
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(body)))
            .andExpect(status().isBadRequest());
    }

    // TC-BOOK-04: Past appointment date
    @Test
    void TC_BOOK_04_pastDate_returns400or422() throws Exception {
        Map<String, Object> body = validBookingPayload();
        body.put("appointmentDate", LocalDate.now().minusDays(1).toString());
        mockMvc.perform(post(BOOKING_URL)
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(body)))
            .andExpect(status().is4xxClientError());
    }
}
