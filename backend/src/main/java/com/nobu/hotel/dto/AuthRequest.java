package com.nobu.hotel.dto;

import jakarta.validation.constraints.NotBlank;

public class AuthRequest {
    @NotBlank
    private String name;
    
    @NotBlank
    private String roomNumber;
    
    @NotBlank
    private String phone;
    
    @NotBlank
    private String username;
    
    @NotBlank
    private String password;

    // Constructors
    public AuthRequest() {}

    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getRoomNumber() { return roomNumber; }
    public void setRoomNumber(String roomNumber) { this.roomNumber = roomNumber; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}