package com.nobu.hotel.config;

import com.nobu.hotel.entity.Admin;
import com.nobu.hotel.entity.MenuItem;
import com.nobu.hotel.entity.Service;
import com.nobu.hotel.entity.Activity;
import com.nobu.hotel.repository.AdminRepository;
import com.nobu.hotel.repository.MenuItemRepository;
import com.nobu.hotel.repository.ServiceRepository;
import com.nobu.hotel.repository.ActivityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Arrays;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private MenuItemRepository menuItemRepository;

    @Autowired
    private ServiceRepository serviceRepository;

    @Autowired
    private ActivityRepository activityRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Initialize admin users
        if (!adminRepository.existsByUsername("admin")) {
            Admin admin = new Admin("admin", passwordEncoder.encode("admin123"), "Administrator", "admin@nobumarrakech.com", Admin.Role.ADMIN);
            adminRepository.save(admin);
        }

        if (!adminRepository.existsByUsername("receptionist")) {
            Admin receptionist = new Admin("receptionist", passwordEncoder.encode("reception123"), "Receptionist", "reception@nobumarrakech.com", Admin.Role.RECEPTIONIST);
            adminRepository.save(receptionist);
        }

        // Initialize menu items
        if (menuItemRepository.count() == 0) {
            menuItemRepository.save(new MenuItem("Miso Black Cod", "Signature dish with sweet miso glaze", new BigDecimal("45.00"), "mains", "https://images.pexels.com/photos/3026808/pexels-photo-3026808.jpeg"));
            menuItemRepository.save(new MenuItem("Yellowtail Sashimi", "Fresh yellowtail with jalapeño and ponzu", new BigDecimal("28.00"), "appetizers", "https://images.pexels.com/photos/248444/pexels-photo-248444.jpeg"));
            menuItemRepository.save(new MenuItem("Wagyu Beef Tataki", "Seared wagyu with truffle ponzu", new BigDecimal("55.00"), "mains", "https://images.pexels.com/photos/357573/pexels-photo-357573.jpeg"));
            menuItemRepository.save(new MenuItem("Chocolate Soufflé", "Warm chocolate soufflé with vanilla ice cream", new BigDecimal("18.00"), "desserts", "https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg"));
            menuItemRepository.save(new MenuItem("Sake Selection", "Premium sake flight with tasting notes", new BigDecimal("35.00"), "beverages", "https://images.pexels.com/photos/5946963/pexels-photo-5946963.jpeg"));
            menuItemRepository.save(new MenuItem("Tuna Tartare", "Fresh tuna with avocado and citrus", new BigDecimal("32.00"), "appetizers", "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg"));
            menuItemRepository.save(new MenuItem("Lobster Tempura", "Crispy lobster with spicy mayo", new BigDecimal("42.00"), "mains", "https://images.pexels.com/photos/725991/pexels-photo-725991.jpeg"));
            menuItemRepository.save(new MenuItem("Green Tea Ice Cream", "Traditional Japanese dessert", new BigDecimal("12.00"), "desserts", "https://images.pexels.com/photos/1352278/pexels-photo-1352278.jpeg"));
        }

        // Initialize services
        if (serviceRepository.count() == 0) {
            serviceRepository.save(new Service("Housekeeping", "Room cleaning and maintenance", new BigDecimal("0.00"), "housekeeping", "https://images.pexels.com/photos/271897/pexels-photo-271897.jpeg", 60, 1));
            serviceRepository.save(new Service("Laundry Service", "Professional laundry and dry cleaning", new BigDecimal("25.00"), "laundry", "https://images.pexels.com/photos/963278/pexels-photo-963278.jpeg", 120, 1));
            serviceRepository.save(new Service("Room Service", "24/7 in-room dining service", new BigDecimal("5.00"), "room-service", "https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg", 30, 1));
            serviceRepository.save(new Service("Concierge", "Personal assistance and recommendations", new BigDecimal("0.00"), "concierge", "https://images.pexels.com/photos/3771115/pexels-photo-3771115.jpeg", 15, 1));
            serviceRepository.save(new Service("Transportation", "Airport transfers and city tours", new BigDecimal("50.00"), "transport", "https://images.pexels.com/photos/1118448/pexels-photo-1118448.jpeg", 60, 4));
            serviceRepository.save(new Service("Maintenance", "Technical support and repairs", new BigDecimal("0.00"), "maintenance", "https://images.pexels.com/photos/1249611/pexels-photo-1249611.jpeg", 45, 1));
        }

        // Initialize activities
        if (activityRepository.count() == 0) {
            activityRepository.save(new Activity("Spa & Wellness", "Rejuvenating spa treatments with traditional Moroccan techniques", new BigDecimal("150.00"), "spa", "https://images.pexels.com/photos/3757942/pexels-photo-3757942.jpeg", 90, 4, "Spa Level", Arrays.asList("09:00", "11:00", "14:00", "16:00", "18:00")));
            activityRepository.save(new Activity("Cooking Class", "Learn to prepare authentic Moroccan cuisine with our master chef", new BigDecimal("85.00"), "culinary", "https://images.pexels.com/photos/2474658/pexels-photo-2474658.jpeg", 180, 8, "Culinary Studio", Arrays.asList("10:00", "15:00")));
            activityRepository.save(new Activity("Yoga Session", "Morning yoga with panoramic views of the Atlas Mountains", new BigDecimal("45.00"), "wellness", "https://images.pexels.com/photos/3822622/pexels-photo-3822622.jpeg", 60, 12, "Rooftop Garden", Arrays.asList("07:00", "08:00", "18:00", "19:00")));
            activityRepository.save(new Activity("City Tour", "Guided tour of Marrakech medina and historical sites", new BigDecimal("75.00"), "tours", "https://images.pexels.com/photos/3889742/pexels-photo-3889742.jpeg", 240, 15, "Hotel Lobby", Arrays.asList("09:00", "14:00")));
            activityRepository.save(new Activity("Hammam Experience", "Traditional Moroccan bath and relaxation", new BigDecimal("120.00"), "spa", "https://images.pexels.com/photos/3188/spa-relax-relax-massage.jpg", 120, 2, "Spa Level", Arrays.asList("10:00", "12:00", "15:00", "17:00")));
            activityRepository.save(new Activity("Desert Excursion", "Day trip to Sahara Desert with camel riding", new BigDecimal("200.00"), "tours", "https://images.pexels.com/photos/3889742/pexels-photo-3889742.jpeg", 480, 20, "Hotel Lobby", Arrays.asList("08:00")));
        }
    }
}