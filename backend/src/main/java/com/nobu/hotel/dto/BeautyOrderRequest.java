package com.nobu.hotel.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.List;

public class BeautyOrderRequest {
    @NotNull
    private Long guestId;

    @NotEmpty
    private List<BeautyOrderItemRequest> items;

    @NotNull
    private BigDecimal total;

    private String notes;

    public BeautyOrderRequest() {}

    // Getters and Setters
    public Long getGuestId() { return guestId; }
    public void setGuestId(Long guestId) { this.guestId = guestId; }

    public List<BeautyOrderItemRequest> getItems() { return items; }
    public void setItems(List<BeautyOrderItemRequest> items) { this.items = items; }

    public BigDecimal getTotal() { return total; }
    public void setTotal(BigDecimal total) { this.total = total; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    // Inner Class
    public static class BeautyOrderItemRequest {
        @NotNull
        private Long beautyProductId;

        @NotNull
        private Integer quantity;

        @NotNull
        private BigDecimal price;

        public BeautyOrderItemRequest() {}

        // Getters and Setters
        public Long getBeautyProductId() { return beautyProductId; }
        public void setBeautyProductId(Long beautyProductId) { this.beautyProductId = beautyProductId; }

        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }

        public BigDecimal getPrice() { return price; }
        public void setPrice(BigDecimal price) { this.price = price; }
    }
}