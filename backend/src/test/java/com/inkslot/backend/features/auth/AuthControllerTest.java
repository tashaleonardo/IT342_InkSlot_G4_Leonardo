package com.inkslot.backend.features.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(locations = "classpath:application-test.properties")
public class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private final String REGISTER_URL = "/api/v1/auth/register";
    private final String LOGIN_URL    = "/api/v1/auth/login";

    // Register a base user before duplicate-email test
    @BeforeEach
    void seedUser() throws Exception {
        Map<String, String> body = Map.of(
            "fullName", "Test Artist",
            "email", "existing@inkslot.com",
            "password", "password123"
        );
        // Ignore result — may already exist from a prior test
        mockMvc.perform(post(REGISTER_URL)
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(body)));
    }

    // TC-AUTH-01: Valid registration
    @Test
    void TC_AUTH_01_validRegistration_returns201WithToken() throws Exception {
        Map<String, String> body = Map.of(
            "fullName", "New Artist",
            "email", "newartist@inkslot.com",
            "password", "password123"
        );
        mockMvc.perform(post(REGISTER_URL)
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(body)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.data.accessToken").exists());
    }

    // TC-AUTH-02: Duplicate email
    @Test
    void TC_AUTH_02_duplicateEmail_returns409() throws Exception {
        Map<String, String> body = Map.of(
            "fullName", "Duplicate Artist",
            "email", "existing@inkslot.com",
            "password", "password123"
        );
        mockMvc.perform(post(REGISTER_URL)
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(body)))
            .andExpect(status().isConflict());
    }

    // TC-AUTH-03: Missing email field
    @Test
    void TC_AUTH_03_missingEmail_returns400() throws Exception {
        Map<String, String> body = Map.of(
            "fullName", "No Email Artist",
            "password", "password123"
        );
        mockMvc.perform(post(REGISTER_URL)
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(body)))
            .andExpect(status().isBadRequest());
    }

    // TC-AUTH-04: Valid login
    @Test
    void TC_AUTH_04_validLogin_returns200WithToken() throws Exception {
        Map<String, String> body = Map.of(
            "email", "existing@inkslot.com",
            "password", "password123"
        );
        mockMvc.perform(post(LOGIN_URL)
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(body)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.accessToken").exists());
    }

    // TC-AUTH-05: Wrong password
    @Test
    void TC_AUTH_05_wrongPassword_returns401() throws Exception {
        Map<String, String> body = Map.of(
            "email", "existing@inkslot.com",
            "password", "wrongpassword"
        );
        mockMvc.perform(post(LOGIN_URL)
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(body)))
            .andExpect(status().isUnauthorized());
    }

    // TC-AUTH-06: Non-existent email
    @Test
    void TC_AUTH_06_nonExistentEmail_returns401() throws Exception {
        Map<String, String> body = Map.of(
            "email", "ghost@inkslot.com",
            "password", "password123"
        );
        mockMvc.perform(post(LOGIN_URL)
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(body)))
            .andExpect(status().isUnauthorized());
    }
}
