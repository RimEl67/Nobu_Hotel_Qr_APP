package com.nobu.hotel.repository;

import com.nobu.hotel.entity.HotelSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HotelSettingsRepository extends JpaRepository<HotelSettings, Long> { }
