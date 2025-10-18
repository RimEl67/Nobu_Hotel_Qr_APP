package com.nobu.hotel.service;

import com.nobu.hotel.entity.Service;
import com.nobu.hotel.repository.ServiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class ServiceManagementService {

    @Autowired
    private ServiceRepository serviceRepository;

    public List<Service> getAllServices() {
        return serviceRepository.findByAvailableTrue();
    }

    public List<Service> getServicesByCategory(String category) {
        return serviceRepository.findByCategoryAndAvailableTrue(category);
    }

    public Optional<Service> getServiceById(Long id) {
        return serviceRepository.findById(id);
    }

    public Service saveService(Service service) {
        return serviceRepository.save(service);
    }

    public void deleteService(Long id) {
        serviceRepository.deleteById(id);
    }
}