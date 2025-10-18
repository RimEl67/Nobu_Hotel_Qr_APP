package com.nobu.hotel.controller;

import com.nobu.hotel.dto.OrderResponseDto;
import com.nobu.hotel.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/admin/orders")
@CrossOrigin(origins = "*")
public class AdminOrderController {

    @Autowired
    private OrderService orderService;

    // GET /api/admin/orders
    @GetMapping
    public ResponseEntity<List<OrderResponseDto>> getAdminOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }
}
