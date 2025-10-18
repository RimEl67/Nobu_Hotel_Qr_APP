package com.nobu.hotel.controller;

import com.nobu.hotel.entity.HotelSettings;
import com.nobu.hotel.repository.HotelSettingsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/admin/settings")
@CrossOrigin(origins = "*")
public class AdminSettingsController {

    @Autowired
    private HotelSettingsRepository settingsRepository;

    @GetMapping
    public ResponseEntity<HotelSettings> getSettings() {
        HotelSettings s = settingsRepository.findById(1L).orElseGet(() -> {
            HotelSettings def = new HotelSettings();
            def.setId(1L);
            def.setHotelName("Nobu Hotel Marrakech");
            def.setAddress("Avenue Mohammed VI, Marrakech");
            def.setPhone("+212 524 XXX XXX");
            def.setEmail("contact@nobumarrakech.com");
            def.setCheckInTime("15:00");
            def.setCheckOutTime("12:00");
            def.setCurrency("MAD");
            def.setTimezone("Africa/Casablanca");
            def.setWifiPassword("NobuGuest_Free");
            def.setEmergencyNumber("911");
            def.setUpdatedAt(LocalDateTime.now());
            return settingsRepository.save(def);
        });
        return ResponseEntity.ok(s);
    }

    @PutMapping
    public ResponseEntity<HotelSettings> updateSettings(@RequestBody HotelSettings payload) {
        payload.setId(1L);
        payload.setUpdatedAt(LocalDateTime.now());
        HotelSettings saved = settingsRepository.save(payload);
        return ResponseEntity.ok(saved);
    }
}
