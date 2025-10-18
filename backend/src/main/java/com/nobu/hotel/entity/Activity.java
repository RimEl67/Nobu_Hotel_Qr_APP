package com.nobu.hotel.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "activities")
public class Activity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @NotNull
    @Positive
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @NotBlank
    @Column(nullable = false)
    private String category;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(nullable = false)
    private Boolean available = true;

    @Column(name = "duration_minutes")
    private Integer durationMinutes;

    @Column(name = "max_capacity")
    private Integer maxCapacity;

    @Column(name = "location")
    private String location;

    @Column(name = "rating")
    private Double rating = 4.5;

    @ElementCollection
    @CollectionTable(name = "activity_time_slots", joinColumns = @JoinColumn(name = "activity_id"))
    @Column(name = "time_slot")
    private List<String> availableTimeSlots;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

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
    public Activity() {}

    public Activity(String name, String description, BigDecimal price, String category, String imageUrl, 
                   Integer durationMinutes, Integer maxCapacity, String location, List<String> availableTimeSlots) {
        this.name = name;
        this.description = description;
        this.price = price;
        this.category = category;
        this.imageUrl = imageUrl;
        this.durationMinutes = durationMinutes;
        this.maxCapacity = maxCapacity;
        this.location = location;
        this.availableTimeSlots = availableTimeSlots;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public Boolean getAvailable() { return available; }
    public void setAvailable(Boolean available) { this.available = available; }

    public Integer getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }

    public Integer getMaxCapacity() { return maxCapacity; }
    public void setMaxCapacity(Integer maxCapacity) { this.maxCapacity = maxCapacity; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }

    public List<String> getAvailableTimeSlots() { return availableTimeSlots; }
    public void setAvailableTimeSlots(List<String> availableTimeSlots) { this.availableTimeSlots = availableTimeSlots; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}