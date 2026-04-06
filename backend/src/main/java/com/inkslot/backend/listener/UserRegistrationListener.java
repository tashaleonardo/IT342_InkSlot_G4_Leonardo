package com.inkslot.backend.listener;

import com.inkslot.backend.event.UserRegisteredEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;


@Component
@Slf4j
public class UserRegistrationListener {

    @EventListener
    public void onUserRegistered(UserRegisteredEvent event) {
        log.info("[Observer] User registered — email: {}, role: {}, id: {}",
                event.getUser().getEmail(),
                event.getUser().getRole(),
                event.getUser().getId());
    }
}