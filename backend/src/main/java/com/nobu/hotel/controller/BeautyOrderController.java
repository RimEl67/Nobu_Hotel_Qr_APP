package com.nobu.hotel.controller;

import com.nobu.hotel.dto.BeautyOrderRequest;
import com.nobu.hotel.entity.BeautyOrder;
import com.nobu.hotel.service.BeautyOrderService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/beauty-orders")
@CrossOrigin(origins = "*")
public class BeautyOrderController {

    @Autowired
    private BeautyOrderService beautyOrderService;

    @PostMapping
    public ResponseEntity<?> createBeautyOrder(
            @Valid @RequestBody BeautyOrderRequest request,
            HttpServletRequest httpRequest
    ) {
        try {
            Object userIdObj = httpRequest.getAttribute("userId");
            if (userIdObj != null) {
                Long userId = Long.parseLong(userIdObj.toString());
                request.setGuestId(userId);
            }
            BeautyOrder beautyOrder = beautyOrderService.createBeautyOrder(request);
            return ResponseEntity.ok(beautyOrder);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Failed to place beauty order",
                    "details", e.getMessage() != null ? e.getMessage() : "Unknown error"
            ));
        }
    }

    @GetMapping
    public ResponseEntity<List<BeautyOrder>> getAllBeautyOrders() {
        List<BeautyOrder> beautyOrders = beautyOrderService.getAllBeautyOrders();
        return ResponseEntity.ok(beautyOrders);
    }

    @GetMapping("/guest/{guestId}")
    public ResponseEntity<?> getBeautyOrdersByGuest(@PathVariable Long guestId) {
        try {
            List<BeautyOrder> beautyOrders = beautyOrderService.getBeautyOrdersByGuest(guestId);
            return ResponseEntity.ok(beautyOrders);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Failed to fetch guest beauty orders",
                    "details", e.getMessage() != null ? e.getMessage() : "Unknown error"
            ));
        }
    }

    @PutMapping("/{beautyOrderId}/status")
    public ResponseEntity<?> updateBeautyOrderStatus(
            @PathVariable Long beautyOrderId,
            @RequestBody Map<String, String> request
    ) {
        try {
            BeautyOrder.Status status = BeautyOrder.Status.valueOf(request.get("status").toUpperCase());
            BeautyOrder beautyOrder = beautyOrderService.updateBeautyOrderStatus(beautyOrderId, status);
            return ResponseEntity.ok(beautyOrder);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Failed to update beauty order status",
                    "details", e.getMessage() != null ? e.getMessage() : "Unknown error"
            ));
        }
    }
}