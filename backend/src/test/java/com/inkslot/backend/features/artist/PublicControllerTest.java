package com.inkslot.backend.features.artist;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(locations = "classpath:application-test.properties")
public class PublicControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private final String ARTISTS_URL = "/api/v1/artists";

    // TC-ART-01: Public endpoint returns 200
    @Test
    void TC_ART_01_artistListing_returns200NoAuthRequired() throws Exception {
        mockMvc.perform(get(ARTISTS_URL))
            .andExpect(status().isOk());
    }

    // TC-ART-02: Response is a JSON array
    @Test
    void TC_ART_02_artistListing_returnsJsonArray() throws Exception {
        mockMvc.perform(get(ARTISTS_URL))
            .andExpect(status().isOk())
            .andExpect(content().contentTypeCompatibleWith(
                org.springframework.http.MediaType.APPLICATION_JSON));
    }
}