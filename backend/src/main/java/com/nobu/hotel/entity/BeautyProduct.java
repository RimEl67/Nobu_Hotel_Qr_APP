package com.nobu.hotel.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "beauty_products")
public class BeautyProduct {
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

    @Column(nullable = false)
    private Integer stockQuantity = 0;

    @Column(name = "product_size")
    private String size;

    @Column(nullable = false)
    private Double rating = 4.5;

    @ElementCollection
    @CollectionTable(name = "beauty_product_benefits", joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "benefit")
    private List<String> benefits;

    @ElementCollection
    @CollectionTable(name = "beauty_product_ingredients", joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "ingredient")
    private List<String> ingredients;

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
    public BeautyProduct() {}

    public BeautyProduct(String name, String description, BigDecimal price, String category,
                         String imageUrl, String size, List<String> benefits, List<String> ingredients, Integer stockQuantity) {
        this.name = name;
        this.description = description;
        this.price = price;
        this.category = category;
        this.imageUrl = imageUrl;
        this.size = size;
        this.benefits = benefits;
        this.ingredients = ingredients;
        this.stockQuantity = stockQuantity;
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

    public Integer getStockQuantity() { return stockQuantity; }
    public void setStockQuantity(Integer stockQuantity) { this.stockQuantity = stockQuantity; }

    public String getSize() { return size; }
    public void setSize(String size) { this.size = size; }

    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }

    public List<String> getBenefits() { return benefits; }
    public void setBenefits(List<String> benefits) { this.benefits = benefits; }

    public List<String> getIngredients() { return ingredients; }
    public void setIngredients(List<String> ingredients) { this.ingredients = ingredients; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}