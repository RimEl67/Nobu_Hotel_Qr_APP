package com.nobu.hotel.service;

import com.nobu.hotel.dto.GuestLoginRequest;
import com.nobu.hotel.dto.AdminLoginRequest;
import com.nobu.hotel.dto.AuthResponse;
import com.nobu.hotel.entity.Admin;
import com.nobu.hotel.entity.Guest;
import com.nobu.hotel.repository.AdminRepository;
import com.nobu.hotel.repository.GuestRepository;
import com.nobu.hotel.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private GuestRepository guestRepository;

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public AuthResponse authenticateGuest(GuestLoginRequest request) {
        Optional<Guest> guestOpt = guestRepository.findByNameAndRoomNumberAndPhone(
                request.getName(), request.getRoomNumber(), request.getPhone());

        Guest guest;
        if (guestOpt.isPresent()) {
            guest = guestOpt.get();
        } else {
            // Create new guest if not exists
            guest = new Guest(request.getName(), request.getRoomNumber(), request.getPhone());
            guest = guestRepository.save(guest);
        }

        String token = jwtUtil.generateToken(guest.getName(), "GUEST", guest.getId());

        AuthResponse response = new AuthResponse(guest.getId(), guest.getName(), "guest", token);
        response.setRoomNumber(guest.getRoomNumber());
        response.setPhone(guest.getPhone());

        return response;
    }

    public AuthResponse authenticateAdmin(AdminLoginRequest request) {
        Optional<Admin> adminOpt = adminRepository.findByUsername(request.getUsername());

        if (adminOpt.isEmpty()) {
            throw new RuntimeException("Invalid credentials");
        }

        Admin admin = adminOpt.get();
        if (!passwordEncoder.matches(request.getPassword(), admin.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        String token = jwtUtil.generateToken(admin.getUsername(), "ADMIN", admin.getId());

        AuthResponse response = new AuthResponse(admin.getId(), admin.getName(), "admin", token);
        response.setEmail(admin.getEmail());

        return response;
    }
}