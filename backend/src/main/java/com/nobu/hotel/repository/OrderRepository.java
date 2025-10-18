package com.nobu.hotel.repository;

import com.nobu.hotel.entity.Order;
import com.nobu.hotel.entity.Guest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByGuestOrderByCreatedAtDesc(Guest guest);
    List<Order> findByStatusOrderByCreatedAtDesc(Order.Status status);
    List<Order> findAllByOrderByCreatedAtDesc();
    
    @Query("SELECT COUNT(o) FROM Order o WHERE o.createdAt BETWEEN :startDate AND :endDate")
    Long countOrdersBetweenDates(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT SUM(o.total) FROM Order o WHERE o.status = 'DELIVERED' AND o.createdAt BETWEEN :startDate AND :endDate")
    Double getTotalRevenueBetweenDates(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
}