package com.nobu.hotel.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class ReservationRequest {
    @NotNull
    private Long guestId;

    @NotBlank
    private String activityType;

    @NotNull
    private String date;

    @NotNull
    private String time;

    private String notes;

    // Constructors
    public ReservationRequest() {}

    // Getters and Setters
    public Long getGuestId() { return guestId; }
    public void setGuestId(Long guestId) { this.guestId = guestId; }

    public String getActivityType() { return activityType; }
    public void setActivityType(String activityType) { this.activityType = activityType; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getTime() { return time; }
    public void setTime(String time) { this.time = time; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}