package com.nobu.hotel.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "hotel_settings")
public class HotelSettings {

    @Id
    private Long id = 1L;

    private String hotelName;
    private String address;
    private String phone;
    private String email;
    private String checkInTime;
    private String checkOutTime;
    private String currency;
    private String timezone;
    private String wifiPassword;
    private String emergencyNumber;

    private LocalDateTime updatedAt;

    // getters & setters

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getHotelName() { return hotelName; }
    public void setHotelName(String hotelName) { this.hotelName = hotelName; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getCheckInTime() { return checkInTime; }
    public void setCheckInTime(String checkInTime) { this.checkInTime = checkInTime; }

    public String getCheckOutTime() { return checkOutTime; }
    public void setCheckOutTime(String checkOutTime) { this.checkOutTime = checkOutTime; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getTimezone() { return timezone; }
    public void setTimezone(String timezone) { this.timezone = timezone; }

    public String getWifiPassword() { return wifiPassword; }
    public void setWifiPassword(String wifiPassword) { this.wifiPassword = wifiPassword; }

    public String getEmergencyNumber() { return emergencyNumber; }
    public void setEmergencyNumber(String emergencyNumber) { this.emergencyNumber = emergencyNumber; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
