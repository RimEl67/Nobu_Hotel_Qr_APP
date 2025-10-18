package com.nobu.hotel.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class OrderResponseDto {
    private Long id;
    private Long guestId;
    private List<OrderItemDto> items;
    private BigDecimal total;
    private String status;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Getters & Setters

    public static class OrderItemDto {
        private Long id;
        private Long menuItemId;
        private String menuItemName;
        private Integer quantity;
        private BigDecimal price;
        // Getters & Setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getMenuItemId() { return menuItemId; }
        public void setMenuItemId(Long menuItemId) { this.menuItemId = menuItemId; }
        public String getMenuItemName() { return menuItemName; }
        public void setMenuItemName(String menuItemName) { this.menuItemName = menuItemName; }
        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }
        public BigDecimal getPrice() { return price; }
        public void setPrice(BigDecimal price) { this.price = price; }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getGuestId() { return guestId; }
    public void setGuestId(Long guestId) { this.guestId = guestId; }
    public List<OrderItemDto> getItems() { return items; }
    public void setItems(List<OrderItemDto> items) { this.items = items; }
    public BigDecimal getTotal() { return total; }
    public void setTotal(BigDecimal total) { this.total = total; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
