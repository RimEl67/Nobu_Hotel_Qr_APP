package com.nobu.hotel.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

@Entity
@Table(name = "beauty_order_items")
public class BeautyOrderItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "beauty_order_id", nullable = false)
    private BeautyOrder beautyOrder;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "beauty_product_id", nullable = false)
    private BeautyProduct beautyProduct;

    @NotNull
    @Positive
    @Column(nullable = false)
    private Integer quantity;

    @NotNull
    @Positive
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    // Constructors
    public BeautyOrderItem() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public BeautyOrder getBeautyOrder() { return beautyOrder; }
    public void setBeautyOrder(BeautyOrder beautyOrder) { this.beautyOrder = beautyOrder; }

    public BeautyProduct getBeautyProduct() { return beautyProduct; }
    public void setBeautyProduct(BeautyProduct beautyProduct) { this.beautyProduct = beautyProduct; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
}