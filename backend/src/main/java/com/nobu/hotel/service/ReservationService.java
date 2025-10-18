package com.nobu.hotel.service;

import com.nobu.hotel.entity.ActivityReservation;
import com.nobu.hotel.entity.Guest;
import com.nobu.hotel.repository.ActivityReservationRepository;
import com.nobu.hotel.repository.GuestRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
public class ReservationService {

    private final ActivityReservationRepository reservationRepo;
    private final GuestRepository guestRepository;

    public ReservationService(ActivityReservationRepository reservationRepo,
                              GuestRepository guestRepository) {
        this.reservationRepo = reservationRepo;
        this.guestRepository = guestRepository;
    }

    /* ======================== READ ======================== */

    // Toutes les réservations triées du plus récent au plus ancien
    public List<ActivityReservation> findAll() {
        return reservationRepo.findAllByOrderByCreatedAtDesc();
    }

    // Réservations d’un invité par son id, triées par createdAt DESC
    public List<ActivityReservation> findByGuest(Long guestId) {
        return reservationRepo.findByGuestIdOrderByCreatedAtDesc(guestId);
    }

    // Vérifie si un créneau (activité + date + heure) est libre
    public boolean isAvailable(String activityType, LocalDate date, LocalTime time) {
        long taken = reservationRepo.countConflictingReservations(activityType, date, time);
        return taken == 0;
    }

    /* ==================== CREATE / UPDATE ================== */

    @Transactional
    public ActivityReservation createReservation(String activityType,
                                                 LocalDate date,
                                                 LocalTime time,
                                                 Long guestId,
                                                 String notes) {
        // 1) Existence du guest
        Guest guest = guestRepository.findById(guestId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Guest not found"));

        // 2) Créneau disponible ?
        if (!isAvailable(activityType, date, time)) {
            // 409 => conflit fonctionnel (créneau déjà pris PENDING/APPROVED)
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Time slot not available");
        }

        // 3) Création + statut par défaut
        ActivityReservation r = new ActivityReservation();
        r.setActivityType(activityType);
        r.setDate(date);
        r.setTime(time);
        r.setStatus(ActivityReservation.Status.PENDING);
        r.setNotes(notes);
        r.setGuest(guest);

        return reservationRepo.save(r);
    }

    @Transactional
    public ActivityReservation updateStatus(Long reservationId, String status) {
        ActivityReservation r = reservationRepo.findById(reservationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reservation not found"));

        ActivityReservation.Status newStatus;
        try {
            newStatus = ActivityReservation.Status.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid status value");
        }

        r.setStatus(newStatus);
        return reservationRepo.save(r);
    }
}
