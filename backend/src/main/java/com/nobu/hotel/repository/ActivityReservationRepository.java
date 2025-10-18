package com.nobu.hotel.repository;

import com.nobu.hotel.entity.ActivityReservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface ActivityReservationRepository extends JpaRepository<ActivityReservation, Long> {

    /* ========= READ ========= */

    // Toutes les réservations triées par date de création DESC
    List<ActivityReservation> findAllByOrderByCreatedAtDesc();

    // Réservations d’un invité (via son id) triées par date de création DESC
    List<ActivityReservation> findByGuestIdOrderByCreatedAtDesc(Long guestId);

    // (optionnel) Filtrer par statut si besoin dans l’admin
    List<ActivityReservation> findByStatusOrderByCreatedAtDesc(ActivityReservation.Status status);


    /* ========= CHECK DISPONIBILITÉ ========= */

    // Compte le nombre de réservations qui "occupent" déjà ce créneau
    // (on considère PENDING + APPROVED comme pris ; CANCELED/REJECTED ne bloquent pas)
    @Query("""
        SELECT COUNT(ar)
        FROM ActivityReservation ar
        WHERE ar.activityType = :activityType
          AND ar.date        = :date
          AND ar.time        = :time
          AND ar.status IN ('PENDING','APPROVED')
    """)
    Long countConflictingReservations(@Param("activityType") String activityType,
                                      @Param("date")        LocalDate date,
                                      @Param("time")        LocalTime time);


    /* ========= STATS / PÉRIODE ========= */

    // Compte des réservations créées entre deux instants (pour le dashboard)
    @Query("""
        SELECT COUNT(ar)
        FROM ActivityReservation ar
        WHERE ar.createdAt BETWEEN :startDate AND :endDate
    """)
    Long countReservationsBetweenDates(@Param("startDate") LocalDateTime startDate,
                                       @Param("endDate")   LocalDateTime endDate);
}
