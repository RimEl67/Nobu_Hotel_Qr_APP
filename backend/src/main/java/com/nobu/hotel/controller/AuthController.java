package com.nobu.hotel.controller;

import com.nobu.hotel.dto.GuestLoginRequest;
import com.nobu.hotel.dto.AdminLoginRequest;
import com.nobu.hotel.dto.AuthResponse;
import com.nobu.hotel.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/guests/authenticate")
    public ResponseEntity<AuthResponse> authenticateGuest(@Valid @RequestBody GuestLoginRequest request) {
        System.out.println("Guest authentication request received: " + request.toString());
        try {
            AuthResponse response = authService.authenticateGuest(request);
            System.out.println("Guest authentication successful for: " + response.getName());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Guest authentication failed: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/admins/authenticate")
    public ResponseEntity<AuthResponse> authenticateAdmin(@Valid @RequestBody AdminLoginRequest request) {
        System.out.println("Admin authentication request received: " + request.toString());
        try {
            AuthResponse response = authService.authenticateAdmin(request);
            System.out.println("Admin authentication successful for: " + response.getName());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Admin authentication failed: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }
}