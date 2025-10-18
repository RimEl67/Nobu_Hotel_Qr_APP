package com.nobu.hotel.repository;

import com.nobu.hotel.entity.ServiceRequest;
import com.nobu.hotel.entity.Guest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ServiceRequestRepository extends JpaRepository<ServiceRequest, Long> {
    List<ServiceRequest> findByGuestOrderByCreatedAtDesc(Guest guest);
    List<ServiceRequest> findByStatusOrderByCreatedAtDesc(ServiceRequest.Status status);
    List<ServiceRequest> findAllByOrderByCreatedAtDesc();

    @Query("SELECT COUNT(sr) FROM ServiceRequest sr WHERE sr.createdAt BETWEEN :startDate AND :endDate")
    Long countServiceRequestsBetweenDates(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
}