package com.nobu.hotel.service;

import com.nobu.hotel.dto.AdminStatsDto;
import com.nobu.hotel.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Service
public class AdminStatsService {

    @Autowired
    private GuestRepository guestRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ServiceRequestRepository serviceRequestRepository;

    @Autowired
    private ActivityReservationRepository reservationRepository;

    public AdminStatsDto getOverallStats() {
        Long totalGuests = guestRepository.count();
        Long totalOrders = orderRepository.count();
        Long totalServiceRequests = serviceRequestRepository.count();
        Long totalReservations = reservationRepository.count();

        Double revenue = orderRepository.getTotalRevenueBetweenDates(
                LocalDateTime.now().minus(365, ChronoUnit.DAYS), LocalDateTime.now());

        return new AdminStatsDto(totalGuests, totalOrders, totalServiceRequests, totalReservations,
                revenue != null ? BigDecimal.valueOf(revenue) : BigDecimal.ZERO);
    }

    public AdminStatsDto getStatsByPeriod(String period) {
        LocalDateTime startDate;
        LocalDateTime endDate = LocalDateTime.now();

        switch (period.toLowerCase()) {
            case "day":
                startDate = endDate.minus(1, ChronoUnit.DAYS);
                break;
            case "week":
                startDate = endDate.minus(7, ChronoUnit.DAYS);
                break;
            case "month":
                startDate = endDate.minus(30, ChronoUnit.DAYS);
                break;
            default:
                startDate = endDate.minus(365, ChronoUnit.DAYS);
        }

        Long totalOrders = orderRepository.countOrdersBetweenDates(startDate, endDate);
        Long totalServiceRequests = serviceRequestRepository.countServiceRequestsBetweenDates(startDate, endDate);
        Long totalReservations = reservationRepository.countReservationsBetweenDates(startDate, endDate);

        Double revenue = orderRepository.getTotalRevenueBetweenDates(startDate, endDate);

        return new AdminStatsDto(guestRepository.count(), totalOrders, totalServiceRequests, totalReservations,
                revenue != null ? BigDecimal.valueOf(revenue) : BigDecimal.ZERO);
    }
}