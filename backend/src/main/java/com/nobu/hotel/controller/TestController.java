package com.nobu.hotel.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/test")
@CrossOrigin(origins = "*")
public class TestController {

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        return ResponseEntity.ok(Map.of(
            "status", "OK",
            "message", "Backend is running",
            "timestamp", java.time.LocalDateTime.now().toString()
        ));
    }

    @PostMapping("/echo")
    public ResponseEntity<Map<String, Object>> echo(@RequestBody Map<String, Object> request) {
        return ResponseEntity.ok(Map.of(
            "received", request,
            "timestamp", java.time.LocalDateTime.now().toString()
        ));
    }
}