package com.nobu.hotel.service;

import com.nobu.hotel.dto.OrderRequest;
import com.nobu.hotel.dto.OrderResponseDto;
import com.nobu.hotel.entity.*;
import com.nobu.hotel.repository.*;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;
    @Autowired
    private GuestRepository guestRepository;
    @Autowired
    private MenuItemRepository menuItemRepository;

    // Création de commande
    @Transactional
    public OrderResponseDto createOrder(OrderRequest request) {
        Guest guest = guestRepository.findById(request.getGuestId())
                .orElseThrow(() -> new RuntimeException("Guest not found"));

        Order order = new Order();
        order.setGuest(guest);
        order.setTotal(request.getTotal());
        order.setStatus(Order.Status.PENDING);
        order.setNotes(request.getNotes());

        // Ajout des items
        List<OrderItem> items = request.getItems().stream().map(itemRequest -> {
            MenuItem menuItem = menuItemRepository.findById(itemRequest.getMenuItemId())
                    .orElseThrow(() -> new RuntimeException("Menu item not found"));
            OrderItem item = new OrderItem();
            item.setOrder(order); // <-- important !
            item.setMenuItem(menuItem);
            item.setQuantity(itemRequest.getQuantity());
            item.setPrice(itemRequest.getPrice());
            return item;
        }).collect(Collectors.toList());

        order.setItems(items);

        Order savedOrder = orderRepository.save(order);

        return toDto(savedOrder);
    }

    // Récupérer toutes les commandes (DTO)
    public List<OrderResponseDto> getAllOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    // Récupérer les commandes d'un guest (DTO)
    public List<OrderResponseDto> getOrdersByGuest(Long guestId) {
        Guest guest = guestRepository.findById(guestId)
                .orElseThrow(() -> new RuntimeException("Guest not found"));
        return orderRepository.findByGuestOrderByCreatedAtDesc(guest)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    // Mettre à jour le statut de la commande
    @Transactional
    public OrderResponseDto updateOrderStatus(Long orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setStatus(Order.Status.valueOf(status.toUpperCase()));
        return toDto(orderRepository.save(order));
    }

    // Méthode utilitaire pour convertir Order -> OrderResponseDto
    private OrderResponseDto toDto(Order order) {
        OrderResponseDto dto = new OrderResponseDto();
        dto.setId(order.getId());
        dto.setGuestId(order.getGuest().getId());
        dto.setTotal(order.getTotal());
        dto.setStatus(order.getStatus().name());
        dto.setNotes(order.getNotes());
        dto.setCreatedAt(order.getCreatedAt());
        dto.setUpdatedAt(order.getUpdatedAt());
        dto.setItems(order.getItems().stream().map(item -> {
            OrderResponseDto.OrderItemDto itemDto = new OrderResponseDto.OrderItemDto();
            itemDto.setId(item.getId());
            itemDto.setMenuItemId(item.getMenuItem().getId());
            itemDto.setMenuItemName(item.getMenuItem().getName());
            itemDto.setQuantity(item.getQuantity());
            itemDto.setPrice(item.getPrice());
            return itemDto;
        }).collect(Collectors.toList()));
        return dto;
    }
}
