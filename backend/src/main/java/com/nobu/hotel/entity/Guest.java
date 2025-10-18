package com.nobu.hotel.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "guests")
public class Guest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String name;

    @Column(name = "room_number", nullable = false)
    private String roomNumber;

    @Column(nullable = false)
    private String phone;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "guest", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Order> orders;

    @OneToMany(mappedBy = "guest", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ServiceRequest> serviceRequests;

    @OneToMany(mappedBy = "guest", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ActivityReservation> reservations;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Constructors
    public Guest() {}

    public Guest(String name, String roomNumber, String phone) {
        this.name = name;
        this.roomNumber = roomNumber;
        this.phone = phone;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getRoomNumber() { return roomNumber; }
    public void setRoomNumber(String roomNumber) { this.roomNumber = roomNumber; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public List<Order> getOrders() { return orders; }
    public void setOrders(List<Order> orders) { this.orders = orders; }

    public List<ServiceRequest> getServiceRequests() { return serviceRequests; }
    public void setServiceRequests(List<ServiceRequest> serviceRequests) { this.serviceRequests = serviceRequests; }

    public List<ActivityReservation> getReservations() { return reservations; }
    public void setReservations(List<ActivityReservation> reservations) { this.reservations = reservations; }
}