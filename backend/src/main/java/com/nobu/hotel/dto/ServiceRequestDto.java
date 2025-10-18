package com.nobu.hotel.dto;

import com.nobu.hotel.entity.ServiceRequest;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class ServiceRequestDto {

    @NotNull(message = "L'ID du client est obligatoire")
    private Long guestId;

    @NotBlank(message = "Le type de service est obligatoire")
    private String type;

    private String description;

    @NotNull(message = "La priorité est obligatoire")
    private ServiceRequest.Priority priority;

    // --- Constructeurs ---
    public ServiceRequestDto() {}

    public ServiceRequestDto(Long guestId, String type, String description, ServiceRequest.Priority priority) {
        this.guestId = guestId;
        this.type = type;
        this.description = description;
        this.priority = priority;
    }

    // --- Getters & Setters ---
    public Long getGuestId() { return guestId; }
    public void setGuestId(Long guestId) { this.guestId = guestId; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public ServiceRequest.Priority getPriority() { return priority; }
    public void setPriority(ServiceRequest.Priority priority) { this.priority = priority; }
}