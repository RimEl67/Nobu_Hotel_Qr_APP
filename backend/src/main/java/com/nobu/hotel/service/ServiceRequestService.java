package com.nobu.hotel.service;

import com.nobu.hotel.dto.ServiceRequestDto;
import com.nobu.hotel.entity.Guest;
import com.nobu.hotel.entity.ServiceRequest;
import com.nobu.hotel.repository.GuestRepository;
import com.nobu.hotel.repository.ServiceRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ServiceRequestService {

    @Autowired
    private ServiceRequestRepository serviceRequestRepository;

    @Autowired
    private GuestRepository guestRepository;

    /**
     * Crée une nouvelle demande de service à partir du DTO.
     */
    @Transactional
    public ServiceRequest createServiceRequest(ServiceRequestDto dto) {
        Guest guest = guestRepository.findById(dto.getGuestId())
                .orElseThrow(() -> new IllegalArgumentException("Guest not found with ID " + dto.getGuestId()));

        ServiceRequest serviceRequest = new ServiceRequest(
                guest,
                dto.getType(),
                dto.getDescription(),
                dto.getPriority()
        );
        return serviceRequestRepository.save(serviceRequest);
    }

    /**
     * Retourne toutes les demandes de service (triées par date descendante).
     */
    public List<ServiceRequest> getAllServiceRequests() {
        return serviceRequestRepository.findAllByOrderByCreatedAtDesc();
    }

    /**
     * Retourne toutes les demandes de service pour un guest.
     */
    public List<ServiceRequest> getServiceRequestsByGuest(Long guestId) {
        Guest guest = guestRepository.findById(guestId)
                .orElseThrow(() -> new IllegalArgumentException("Guest not found with ID " + guestId));
        return serviceRequestRepository.findByGuestOrderByCreatedAtDesc(guest);
    }

    /**
     * Met à jour le statut d'une demande de service.
     */
    @Transactional
    public ServiceRequest updateServiceRequestStatus(Long requestId, ServiceRequest.Status status) {
        ServiceRequest serviceRequest = serviceRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Service request not found with ID " + requestId));

        serviceRequest.setStatus(status);
        return serviceRequestRepository.save(serviceRequest);
    }
}