package com.nobu.hotel.repository;

import com.nobu.hotel.entity.Guest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface GuestRepository extends JpaRepository<Guest, Long> {
    Optional<Guest> findByNameAndRoomNumberAndPhone(String name, String roomNumber, String phone);
    Optional<Guest> findByRoomNumber(String roomNumber);
    boolean existsByRoomNumber(String roomNumber);
}