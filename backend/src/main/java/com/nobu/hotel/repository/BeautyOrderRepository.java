package com.nobu.hotel.repository;

import com.nobu.hotel.entity.BeautyOrder;
import com.nobu.hotel.entity.Guest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BeautyOrderRepository extends JpaRepository<BeautyOrder, Long> {
    List<BeautyOrder> findByGuestOrderByCreatedAtDesc(Guest guest);
    List<BeautyOrder> findByStatusOrderByCreatedAtDesc(BeautyOrder.Status status);
    List<BeautyOrder> findAllByOrderByCreatedAtDesc();

    @Query("SELECT COUNT(bo) FROM BeautyOrder bo WHERE bo.createdAt BETWEEN :startDate AND :endDate")
    Long countBeautyOrdersBetweenDates(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT SUM(bo.total) FROM BeautyOrder bo WHERE bo.status = 'DELIVERED' AND bo.createdAt BETWEEN :startDate AND :endDate")
    Double getTotalBeautyRevenueBetweenDates(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
}