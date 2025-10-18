package com.nobu.hotel.controller;

import com.nobu.hotel.dto.ServiceRequestDto;
import com.nobu.hotel.dto.ServiceRequestResponseDto;
import com.nobu.hotel.entity.ServiceRequest;
import com.nobu.hotel.service.ServiceRequestService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/service-requests")
@CrossOrigin(origins = "*")
public class ServiceRequestController {

    @Autowired
    private ServiceRequestService serviceRequestService;

    @PostMapping
    public ResponseEntity<?> createServiceRequest(@Valid @RequestBody ServiceRequestDto dto, HttpServletRequest httpRequest) {
        try {
            Long userId = (Long) httpRequest.getAttribute("userId");
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "User not authenticated"));
            }
            dto.setGuestId(userId);

            ServiceRequest serviceRequest = serviceRequestService.createServiceRequest(dto);
            ServiceRequestResponseDto responseDto = ServiceRequestResponseDto.fromEntity(serviceRequest);

            // Fix : retourne toujours un DTO, JAMAIS null, ni une entité brute
            return ResponseEntity.ok(responseDto);
        } catch (Exception e) {
            // Fix : renvoie une erreur JSON
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }


    @GetMapping
    public ResponseEntity<List<ServiceRequestResponseDto>> getAllServiceRequests() {
        List<ServiceRequest> requests = serviceRequestService.getAllServiceRequests();
        List<ServiceRequestResponseDto> response = requests.stream()
                .map(ServiceRequestResponseDto::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/guest/{guestId}")
    public ResponseEntity<?> getServiceRequestsByGuest(@PathVariable Long guestId) {
        try {
            List<ServiceRequest> requests = serviceRequestService.getServiceRequestsByGuest(guestId);
            List<ServiceRequestResponseDto> response = requests.stream()
                    .map(ServiceRequestResponseDto::fromEntity)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{requestId}/status")
    public ResponseEntity<?> updateServiceRequestStatus(@PathVariable Long requestId, @RequestBody Map<String, String> request) {
        try {
            ServiceRequest.Status status = ServiceRequest.Status.valueOf(request.get("status").toUpperCase().replace("-", "_"));
            ServiceRequest serviceRequest = serviceRequestService.updateServiceRequestStatus(requestId, status);
            ServiceRequestResponseDto responseDto = ServiceRequestResponseDto.fromEntity(serviceRequest);
            return ResponseEntity.ok(responseDto);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }
}