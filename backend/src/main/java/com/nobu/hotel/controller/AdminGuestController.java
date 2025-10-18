package com.nobu.hotel.controller;

import com.nobu.hotel.entity.Guest;
import com.nobu.hotel.dto.OrderResponseDto;
import com.nobu.hotel.repository.GuestRepository;
import com.nobu.hotel.repository.OrderRepository;
import com.nobu.hotel.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/guests")
@CrossOrigin(origins = "*")
public class AdminGuestController {

    @Autowired
    private GuestRepository guestRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderService orderService;

    // GET /api/admin/guests
    @GetMapping
    public ResponseEntity<List<Map<String,Object>>> getAllGuests() {
        List<Guest> guests = guestRepository.findAll();
        List<Map<String,Object>> result = guests.stream().map(g -> {
            Map<String,Object> dto = new HashMap<>();
            dto.put("id", g.getId());
            dto.put("name", g.getName());
            dto.put("roomNumber", g.getRoomNumber());
            dto.put("phone", g.getPhone());
            dto.put("createdAt", g.getCreatedAt());
            // compute orders stats
            List<com.nobu.hotel.entity.Order> orders = orderRepository.findByGuestOrderByCreatedAtDesc(g);
            dto.put("totalOrders", orders.size());
            double totalSpent = orders.stream()
                    .mapToDouble(o -> o.getTotal() != null ? o.getTotal().doubleValue() : 0.0)
                    .sum();
            dto.put("totalSpent", totalSpent);
            // optionally include orders list (simple DTOs) - use OrderService to map them
            List<OrderResponseDto> orderDtos = orderService.getOrdersByGuest(g.getId());
            dto.put("orders", orderDtos);
            return dto;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    // GET /api/admin/guests/{id}
    @GetMapping("/{id}")
    public ResponseEntity<?> getGuestById(@PathVariable Long id) {
        Optional<Guest> opt = guestRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Guest g = opt.get();
        Map<String,Object> dto = new HashMap<>();
        dto.put("id", g.getId());
        dto.put("name", g.getName());
        dto.put("roomNumber", g.getRoomNumber());
        dto.put("phone", g.getPhone());
        dto.put("createdAt", g.getCreatedAt());
        List<OrderResponseDto> orders = orderService.getOrdersByGuest(g.getId());
        dto.put("orders", orders);
        dto.put("totalOrders", orders.size());
        double totalSpent = orders.stream()
                .mapToDouble(o -> o.getTotal() != null ? o.getTotal().doubleValue() : 0.0)
                .sum();
        dto.put("totalSpent", totalSpent);
        return ResponseEntity.ok(dto);
    }
}
