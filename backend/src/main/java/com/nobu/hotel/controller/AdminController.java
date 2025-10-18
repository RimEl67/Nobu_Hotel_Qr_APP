package com.nobu.hotel.controller;

import com.nobu.hotel.dto.AdminStatsDto;
import com.nobu.hotel.service.AdminStatsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private AdminStatsService adminStatsService;

    @GetMapping("/stats")
    public ResponseEntity<AdminStatsDto> getAdminStats(@RequestParam(required = false) String period) {
        AdminStatsDto stats;
        if (period != null && !period.isEmpty()) {
            stats = adminStatsService.getStatsByPeriod(period);
        } else {
            stats = adminStatsService.getOverallStats();
        }
        return ResponseEntity.ok(stats);
    }
}