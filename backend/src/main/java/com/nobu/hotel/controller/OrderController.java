package com.nobu.hotel.controller;

import com.nobu.hotel.dto.OrderRequest;
import com.nobu.hotel.dto.OrderResponseDto;
import com.nobu.hotel.service.OrderService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    @Autowired
    private OrderService orderService;

    // Créer une commande
    @PostMapping
    public ResponseEntity<?> createOrder(@Valid @RequestBody OrderRequest request, HttpServletRequest httpRequest) {
        try {
            Object userIdObj = httpRequest.getAttribute("userId");
            if (userIdObj != null) {
                Long userId = Long.parseLong(userIdObj.toString());
                request.setGuestId(userId);
            }
            OrderResponseDto orderDto = orderService.createOrder(request); // retourne DTO
            return ResponseEntity.ok(orderDto);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Failed to place order",
                    "details", e.getMessage() != null ? e.getMessage() : "Unknown error"
            ));
        }
    }

    // Liste de toutes les commandes
    @GetMapping
    public ResponseEntity<List<OrderResponseDto>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }


    // Liste des commandes par guest
    @GetMapping("/guest/{guestId}")
    public ResponseEntity<List<OrderResponseDto>> getOrdersByGuest(@PathVariable Long guestId) {
        try {
            List<OrderResponseDto> orders = orderService.getOrdersByGuest(guestId);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(List.of());
        }
    }

    // Mise à jour du statut
    @PutMapping("/{orderId}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long orderId, @RequestBody Map<String, String> request) {
        try {
            String status = request.get("status");
            OrderResponseDto orderDto = orderService.updateOrderStatus(orderId, status);
            return ResponseEntity.ok(orderDto);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Failed to update order status",
                    "details", e.getMessage() != null ? e.getMessage() : "Unknown error"
            ));
        }
    }
}
