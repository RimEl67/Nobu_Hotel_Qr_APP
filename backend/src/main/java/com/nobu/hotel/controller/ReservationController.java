// com/nobu/hotel/controller/ReservationController.java
package com.nobu.hotel.controller;

import com.nobu.hotel.dto.ReservationResponseDto;
import com.nobu.hotel.entity.ActivityReservation;
import com.nobu.hotel.service.ReservationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reservations")
public class ReservationController {

    private final ReservationService service;

    public ReservationController(ReservationService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<ReservationResponseDto> create(@RequestBody Map<String, Object> body) {
        String activityType = (String) body.get("activityType");
        LocalDate date = LocalDate.parse((String) body.get("date")); // "yyyy-MM-dd"
        LocalTime time = LocalTime.parse((String) body.get("time")); // "HH:mm"
        Long guestId = Long.valueOf(body.get("guestId").toString());
        String notes = (String) body.getOrDefault("notes", null);

        ActivityReservation r = service.createReservation(activityType, date, time, guestId, notes);
        return ResponseEntity.ok(ReservationResponseDto.fromEntity(r));
    }

    @GetMapping
    public ResponseEntity<List<ReservationResponseDto>> listAll() {
        return ResponseEntity.ok(
                service.findAll().stream().map(ReservationResponseDto::fromEntity).toList()
        );
    }

    @GetMapping("/guest/{guestId}")
    public ResponseEntity<List<ReservationResponseDto>> listByGuest(@PathVariable Long guestId) {
        return ResponseEntity.ok(
                service.findByGuest(guestId).stream().map(ReservationResponseDto::fromEntity).toList()
        );
    }

    @GetMapping("/availability")
    public ResponseEntity<Map<String, Object>> availability(@RequestParam String activityType,
                                                            @RequestParam String date,
                                                            @RequestParam String time) {
        boolean available = service.isAvailable(activityType, LocalDate.parse(date), LocalTime.parse(time));
        return ResponseEntity.ok(Map.of("available", available));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ReservationResponseDto> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String status = body.get("status");
        ActivityReservation r = service.updateStatus(id, status);
        return ResponseEntity.ok(ReservationResponseDto.fromEntity(r));
    }
}
