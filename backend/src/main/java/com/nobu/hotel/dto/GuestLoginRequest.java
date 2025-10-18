package com.nobu.hotel.dto;

import jakarta.validation.constraints.NotBlank;

public class GuestLoginRequest {
    @NotBlank(message = "Name is required")
    private String name;
    
    @NotBlank(message = "Room number is required")
    private String roomNumber;
    
    @NotBlank(message = "Phone is required")
    private String phone;

    // Constructors
    public GuestLoginRequest() {}

    public GuestLoginRequest(String name, String roomNumber, String phone) {
        this.name = name;
        this.roomNumber = roomNumber;
        this.phone = phone;
    }

    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getRoomNumber() { return roomNumber; }
    public void setRoomNumber(String roomNumber) { this.roomNumber = roomNumber; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    @Override
    public String toString() {
        return "GuestLoginRequest{" +
                "name='" + name + '\'' +
                ", roomNumber='" + roomNumber + '\'' +
                ", phone='" + phone + '\'' +
                '}';
    }
}