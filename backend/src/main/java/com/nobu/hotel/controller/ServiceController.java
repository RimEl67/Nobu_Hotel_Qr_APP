package com.nobu.hotel.controller;

import com.nobu.hotel.entity.Service;
import com.nobu.hotel.service.ServiceManagementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/services")
@CrossOrigin(origins = "*")
public class ServiceController {

    @Autowired
    private ServiceManagementService serviceManagementService;

    @GetMapping
    public ResponseEntity<List<Service>> getAllServices() {
        List<Service> services = serviceManagementService.getAllServices();
        return ResponseEntity.ok(services);
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<Service>> getServicesByCategory(@PathVariable String category) {
        List<Service> services = serviceManagementService.getServicesByCategory(category);
        return ResponseEntity.ok(services);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Service> getServiceById(@PathVariable Long id) {
        return serviceManagementService.getServiceById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}