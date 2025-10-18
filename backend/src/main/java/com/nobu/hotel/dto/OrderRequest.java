package com.nobu.hotel.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.List;

public class OrderRequest {
    @NotNull
    private Long guestId;

    @NotEmpty
    private List<OrderItemRequest> items;

    @NotNull
    private BigDecimal total;

    private String notes;

    public OrderRequest() {}

    // Getters and Setters...
    public Long getGuestId() { return guestId; }
    public void setGuestId(Long guestId) { this.guestId = guestId; }

    public List<OrderItemRequest> getItems() { return items; }
    public void setItems(List<OrderItemRequest> items) { this.items = items; }

    public BigDecimal getTotal() { return total; }
    public void setTotal(BigDecimal total) { this.total = total; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    // ----- Inner Class -----
    public static class OrderItemRequest {
        @NotNull
        private Long menuItemId;

        @NotNull
        private Integer quantity;

        @NotNull
        private BigDecimal price;

        public OrderItemRequest() {}

        // Getters and Setters...
        public Long getMenuItemId() { return menuItemId; }
        public void setMenuItemId(Long menuItemId) { this.menuItemId = menuItemId; }

        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }

        public BigDecimal getPrice() { return price; }
        public void setPrice(BigDecimal price) { this.price = price; }
    }
}
