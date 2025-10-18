package com.nobu.hotel.repository;

import com.nobu.hotel.entity.Service;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ServiceRepository extends JpaRepository<Service, Long> {
    List<Service> findByAvailableTrue();
    List<Service> findByCategoryAndAvailableTrue(String category);
    List<Service> findByCategory(String category);
}