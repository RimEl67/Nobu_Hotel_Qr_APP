package com.nobu.hotel.service;

import com.nobu.hotel.dto.BeautyOrderRequest;
import com.nobu.hotel.entity.BeautyOrder;
import com.nobu.hotel.entity.BeautyOrderItem;
import com.nobu.hotel.entity.BeautyProduct;
import com.nobu.hotel.entity.Guest;
import com.nobu.hotel.repository.BeautyOrderRepository;
import com.nobu.hotel.repository.BeautyProductRepository;
import com.nobu.hotel.repository.GuestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class BeautyOrderService {

    @Autowired
    private BeautyOrderRepository beautyOrderRepository;

    @Autowired
    private GuestRepository guestRepository;

    @Autowired
    private BeautyProductRepository beautyProductRepository;

    @Autowired
    private BeautyProductService beautyProductService;

    @Transactional
    public BeautyOrder createBeautyOrder(BeautyOrderRequest request) {
        Optional<Guest> guestOpt = guestRepository.findById(request.getGuestId());
        if (guestOpt.isEmpty()) {
            throw new RuntimeException("Guest not found");
        }

        Guest guest = guestOpt.get();
        BeautyOrder beautyOrder = new BeautyOrder();
        beautyOrder.setGuest(guest);
        beautyOrder.setTotal(request.getTotal());
        beautyOrder.setNotes(request.getNotes());
        beautyOrder.setDeliveryAddress("Room " + guest.getRoomNumber());
        beautyOrder.setStatus(BeautyOrder.Status.PENDING);

        List<BeautyOrderItem> beautyOrderItems = new ArrayList<>();
        for (BeautyOrderRequest.BeautyOrderItemRequest itemRequest : request.getItems()) {
            Optional<BeautyProduct> beautyProductOpt = beautyProductRepository.findById(itemRequest.getBeautyProductId());
            if (beautyProductOpt.isEmpty()) {
                throw new RuntimeException("Beauty product not found: " + itemRequest.getBeautyProductId());
            }

            BeautyProduct beautyProduct = beautyProductOpt.get();

            // Check stock availability
            if (beautyProduct.getStockQuantity() < itemRequest.getQuantity()) {
                throw new RuntimeException("Insufficient stock for product: " + beautyProduct.getName());
            }

            BeautyOrderItem beautyOrderItem = new BeautyOrderItem();
            beautyOrderItem.setBeautyOrder(beautyOrder);
            beautyOrderItem.setBeautyProduct(beautyProduct);
            beautyOrderItem.setQuantity(itemRequest.getQuantity());
            beautyOrderItem.setPrice(itemRequest.getPrice());

            beautyOrderItems.add(beautyOrderItem);

            // Update stock
            beautyProductService.updateStock(beautyProduct.getId(), itemRequest.getQuantity());
        }

        beautyOrder.setItems(beautyOrderItems);
        return beautyOrderRepository.save(beautyOrder);
    }

    public List<BeautyOrder> getAllBeautyOrders() {
        return beautyOrderRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<BeautyOrder> getBeautyOrdersByGuest(Long guestId) {
        Optional<Guest> guestOpt = guestRepository.findById(guestId);
        if (guestOpt.isEmpty()) {
            throw new RuntimeException("Guest not found");
        }
        return beautyOrderRepository.findByGuestOrderByCreatedAtDesc(guestOpt.get());
    }

    public BeautyOrder updateBeautyOrderStatus(Long beautyOrderId, BeautyOrder.Status status) {
        Optional<BeautyOrder> beautyOrderOpt = beautyOrderRepository.findById(beautyOrderId);
        if (beautyOrderOpt.isEmpty()) {
            throw new RuntimeException("Beauty order not found");
        }

        BeautyOrder beautyOrder = beautyOrderOpt.get();
        beautyOrder.setStatus(status);
        return beautyOrderRepository.save(beautyOrder);
    }
}