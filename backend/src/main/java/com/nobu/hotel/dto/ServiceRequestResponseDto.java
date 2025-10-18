package com.nobu.hotel.dto;

import com.nobu.hotel.entity.ServiceRequest;

import java.time.LocalDateTime;

public class ServiceRequestResponseDto {
    private Long id;
    private Long guestId;
    private String type;
    private String description;
    private String priority;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Constructeurs
    public ServiceRequestResponseDto() {}

    public ServiceRequestResponseDto(Long id, Long guestId, String type, String description, String priority, String status, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.guestId = guestId;
        this.type = type;
        this.description = description;
        this.priority = priority;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // GETTERS & SETTERS
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getGuestId() { return guestId; }
    public void setGuestId(Long guestId) { this.guestId = guestId; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    // MAPPING ENTITY -> DTO
    public static ServiceRequestResponseDto fromEntity(ServiceRequest entity) {
        return new ServiceRequestResponseDto(
                entity.getId(),
                entity.getGuest() != null ? entity.getGuest().getId() : null,
                entity.getType(),
                entity.getDescription(),
                entity.getPriority() != null ? entity.getPriority().name() : null,
                entity.getStatus() != null ? entity.getStatus().name() : null,
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }
}