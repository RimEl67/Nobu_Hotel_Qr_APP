package com.nobu.hotel.dto;

import java.math.BigDecimal;

public class AdminStatsDto {
    private Long totalGuests;
    private Long totalOrders;
    private Long totalServiceRequests;
    private Long totalReservations;
    private BigDecimal revenue;

    // Constructors
    public AdminStatsDto() {}

    public AdminStatsDto(Long totalGuests, Long totalOrders, Long totalServiceRequests, Long totalReservations, BigDecimal revenue) {
        this.totalGuests = totalGuests;
        this.totalOrders = totalOrders;
        this.totalServiceRequests = totalServiceRequests;
        this.totalReservations = totalReservations;
        this.revenue = revenue;
    }

    // Getters and Setters
    public Long getTotalGuests() { return totalGuests; }
    public void setTotalGuests(Long totalGuests) { this.totalGuests = totalGuests; }

    public Long getTotalOrders() { return totalOrders; }
    public void setTotalOrders(Long totalOrders) { this.totalOrders = totalOrders; }

    public Long getTotalServiceRequests() { return totalServiceRequests; }
    public void setTotalServiceRequests(Long totalServiceRequests) { this.totalServiceRequests = totalServiceRequests; }

    public Long getTotalReservations() { return totalReservations; }
    public void setTotalReservations(Long totalReservations) { this.totalReservations = totalReservations; }

    public BigDecimal getRevenue() { return revenue; }
    public void setRevenue(BigDecimal revenue) { this.revenue = revenue; }
}