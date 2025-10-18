package com.nobu.hotel.repository;

import com.nobu.hotel.entity.Activity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ActivityRepository extends JpaRepository<Activity, Long> {
    List<Activity> findByAvailableTrue();
    List<Activity> findByCategoryAndAvailableTrue(String category);
    List<Activity> findByCategory(String category);
}