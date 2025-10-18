package com.nobu.hotel.dto;

import com.nobu.hotel.entity.ActivityReservation;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public class ReservationResponseDto {

    private Long id;
    private String activityType;
    private LocalDate date;
    private LocalTime time;
    private String status;              // on renvoie une String au front
    private String notes;
    private Long guestId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ReservationResponseDto() {}

    public ReservationResponseDto(Long id,
                                  String activityType,
                                  LocalDate date,
                                  LocalTime time,
                                  String status,
                                  String notes,
                                  Long guestId,
                                  LocalDateTime createdAt,
                                  LocalDateTime updatedAt) {
        this.id = id;
        this.activityType = activityType;
        this.date = date;
        this.time = time;
        this.status = status;
        this.notes = notes;
        this.guestId = guestId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // --- MAPPER PRATIQUE ---
    public static ReservationResponseDto fromEntity(ActivityReservation r) {
        return new ReservationResponseDto(
                r.getId(),
                r.getActivityType(),
                r.getDate(),
                r.getTime(),
                r.getStatus() != null ? r.getStatus().name() : null,   // <— conversion enum -> String
                r.getNotes(),
                r.getGuest() != null ? r.getGuest().getId() : null,
                r.getCreatedAt(),
                r.getUpdatedAt()
        );
    }

    // Getters / Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getActivityType() { return activityType; }
    public void setActivityType(String activityType) { this.activityType = activityType; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public LocalTime getTime() { return time; }
    public void setTime(LocalTime time) { this.time = time; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public Long getGuestId() { return guestId; }
    public void setGuestId(Long guestId) { this.guestId = guestId; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
