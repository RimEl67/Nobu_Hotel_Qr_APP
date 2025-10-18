package com.nobu.hotel.config;

import com.nobu.hotel.entity.Admin;
import com.nobu.hotel.entity.MenuItem;
import com.nobu.hotel.entity.Service;
import com.nobu.hotel.entity.Activity;
import com.nobu.hotel.entity.BeautyProduct;
import com.nobu.hotel.repository.AdminRepository;
import com.nobu.hotel.repository.MenuItemRepository;
import com.nobu.hotel.repository.ServiceRepository;
import com.nobu.hotel.repository.ActivityRepository;
import com.nobu.hotel.repository.BeautyProductRepository;
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
    private BeautyProductRepository beautyProductRepository;
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
            // Entrées / Appetizers
            menuItemRepository.save(new MenuItem("Yellowtail Sashimi", "Fresh yellowtail with jalapeño and ponzu, Nobu signature", new BigDecimal("280.00"), "appetizers", "https://images.pexels.com/photos/357756/pexels-photo-357756.jpeg"));
            menuItemRepository.save(new MenuItem("Tuna Tartare", "Bluefin tuna tartare with avocado and citrus", new BigDecimal("320.00"), "appetizers", "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg"));
            menuItemRepository.save(new MenuItem("Rock Shrimp Tempura", "Crispy tempura shrimp with spicy creamy sauce", new BigDecimal("260.00"), "appetizers", "https://images.pexels.com/photos/2456435/pexels-photo-2456435.jpeg"));
            menuItemRepository.save(new MenuItem("Tiradito Nikkei", "Raw fish marinated Peruvian-Japanese style", new BigDecimal("240.00"), "appetizers", "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg"));
            menuItemRepository.save(new MenuItem("Edamame with Sea Salt", "Steamed young soybeans with coarse sea salt", new BigDecimal("120.00"), "appetizers", "https://images.pexels.com/photos/5409751/pexels-photo-5409751.jpeg"));
            menuItemRepository.save(new MenuItem("Salmon Tataki", "Seared salmon with citrus soy dressing", new BigDecimal("290.00"), "appetizers", "https://images.pexels.com/photos/725991/pexels-photo-725991.jpeg"));
            
            // Plats principaux / Mains
            menuItemRepository.save(new MenuItem("Miso Black Cod", "Black cod glazed with sweet miso, Nobu signature dish", new BigDecimal("450.00"), "mains", "https://images.pexels.com/photos/3026808/pexels-photo-3026808.jpeg"));
            menuItemRepository.save(new MenuItem("Wagyu Beef Tataki", "Seared Wagyu beef with truffle ponzu", new BigDecimal("550.00"), "mains", "https://images.pexels.com/photos/357573/pexels-photo-357573.jpeg"));
            menuItemRepository.save(new MenuItem("Lobster Tempura", "Crispy lobster tempura with spicy mayo", new BigDecimal("420.00"), "mains", "https://images.pexels.com/photos/725991/pexels-photo-725991.jpeg"));
            menuItemRepository.save(new MenuItem("Chilean Sea Bass", "Grilled Chilean sea bass with miso den gaku", new BigDecimal("480.00"), "mains", "https://images.pexels.com/photos/3026808/pexels-photo-3026808.jpeg"));
        // Initialize beauty products
        if (beautyProductRepository.count() == 0) {
            // Essential Oils
            beautyProductRepository.save(new BeautyProduct(
                "Moroccan Argan Oil",
                "Pure organic argan oil from the Atlas Mountains, perfect for hair and skin nourishment.",
                new BigDecimal("85.00"),
                "essential-oils",
                "https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg",
                "50ml",
                Arrays.asList("Deep moisturizing", "Anti-aging properties", "Hair strengthening", "Skin repair"),
                Arrays.asList("100% Pure Argan Oil", "Vitamin E", "Essential Fatty Acids"),
                50
            ));

            beautyProductRepository.save(new BeautyProduct(
                "Lavender Essential Oil",
                "Calming lavender oil from French Provence, ideal for relaxation and aromatherapy.",
                new BigDecimal("65.00"),
                "essential-oils",
                "https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg",
                "30ml",
                Arrays.asList("Stress relief", "Better sleep", "Skin soothing", "Aromatherapy"),
                Arrays.asList("Pure Lavender Oil", "Natural Linalool", "Lavandyl Acetate"),
                30
            ));

            beautyProductRepository.save(new BeautyProduct(
                "Rose Hip Seed Oil",
                "Premium rose hip oil rich in vitamins and antioxidants for radiant skin.",
                new BigDecimal("95.00"),
                "essential-oils",
                "https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg",
                "30ml",
                Arrays.asList("Skin regeneration", "Scar healing", "Anti-aging", "Hydration"),
                Arrays.asList("Rose Hip Seed Oil", "Vitamin C", "Omega Fatty Acids"),
                25
            ));

            beautyProductRepository.save(new BeautyProduct(
                "Eucalyptus Oil",
                "Refreshing eucalyptus oil for respiratory wellness and muscle relief.",
                new BigDecimal("55.00"),
                "essential-oils",
                "https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg",
                "30ml",
                Arrays.asList("Respiratory support", "Muscle relief", "Mental clarity", "Antimicrobial"),
                Arrays.asList("Pure Eucalyptus Oil", "Eucalyptol", "Natural Terpenes"),
                40
            ));

            // Luxury Creams
            beautyProductRepository.save(new BeautyProduct(
                "Gold Infused Night Cream",
                "Luxurious anti-aging night cream infused with 24k gold particles.",
                new BigDecimal("180.00"),
                "creams",
                "https://images.pexels.com/photos/3685530/pexels-photo-3685530.jpeg",
                "50ml",
                Arrays.asList("Anti-aging", "Skin firming", "Deep hydration", "Luxury experience"),
                Arrays.asList("24k Gold", "Hyaluronic Acid", "Peptides", "Shea Butter"),
                20
            ));

            beautyProductRepository.save(new BeautyProduct(
                "Moroccan Clay Face Cream",
                "Nourishing face cream with authentic Moroccan clay and argan oil.",
                new BigDecimal("120.00"),
                "creams",
                "https://images.pexels.com/photos/3685530/pexels-photo-3685530.jpeg",
                "75ml",
                Arrays.asList("Pore cleansing", "Oil control", "Skin purification", "Natural glow"),
                Arrays.asList("Moroccan Clay", "Argan Oil", "Aloe Vera", "Rose Water"),
                35
            ));

            beautyProductRepository.save(new BeautyProduct(
                "Intensive Hand Cream",
                "Rich hand cream with shea butter and vitamin E for soft, smooth hands.",
                new BigDecimal("45.00"),
                "creams",
                "https://images.pexels.com/photos/3685530/pexels-photo-3685530.jpeg",
                "100ml",
                Arrays.asList("Deep moisturizing", "Hand protection", "Quick absorption", "Long-lasting"),
                Arrays.asList("Shea Butter", "Vitamin E", "Glycerin", "Coconut Oil"),
                60
            ));

            beautyProductRepository.save(new BeautyProduct(
                "Body Butter Cream",
                "Ultra-rich body cream with cocoa butter and natural oils.",
                new BigDecimal("75.00"),
                "creams",
                "https://images.pexels.com/photos/3685530/pexels-photo-3685530.jpeg",
                "200ml",
                Arrays.asList("Intense hydration", "Skin softening", "Long-lasting moisture", "Natural fragrance"),
                Arrays.asList("Cocoa Butter", "Coconut Oil", "Vitamin E", "Natural Fragrance"),
                45
            ));

            // Face Serums
            beautyProductRepository.save(new BeautyProduct(
                "Vitamin C Brightening Serum",
                "Powerful vitamin C serum for brighter, more radiant skin.",
                new BigDecimal("110.00"),
                "serums",
                "https://images.pexels.com/photos/3685530/pexels-photo-3685530.jpeg",
                "30ml",
                Arrays.asList("Skin brightening", "Dark spot reduction", "Antioxidant protection", "Collagen boost"),
                Arrays.asList("Vitamin C", "Hyaluronic Acid", "Niacinamide", "Vitamin E"),
                30
            ));

            beautyProductRepository.save(new BeautyProduct(
                "Hyaluronic Acid Serum",
                "Intensive hydrating serum with multiple types of hyaluronic acid.",
                new BigDecimal("95.00"),
                "serums",
                "https://images.pexels.com/photos/3685530/pexels-photo-3685530.jpeg",
                "30ml",
                Arrays.asList("Deep hydration", "Plumping effect", "Fine line reduction", "Skin barrier repair"),
                Arrays.asList("Hyaluronic Acid", "Sodium Hyaluronate", "Glycerin", "Aloe Vera"),
                25
            ));

            beautyProductRepository.save(new BeautyProduct(
                "Retinol Anti-Aging Serum",
                "Advanced retinol serum for mature skin and anti-aging benefits.",
                new BigDecimal("135.00"),
                "serums",
                "https://images.pexels.com/photos/3685530/pexels-photo-3685530.jpeg",
                "30ml",
                Arrays.asList("Anti-aging", "Wrinkle reduction", "Skin renewal", "Texture improvement"),
                Arrays.asList("Retinol", "Vitamin E", "Squalane", "Peptides"),
                20
            ));

            // Face Masks
            beautyProductRepository.save(new BeautyProduct(
                "Dead Sea Mud Mask",
                "Purifying mud mask with minerals from the Dead Sea.",
                new BigDecimal("65.00"),
                "masks",
                "https://images.pexels.com/photos/3685530/pexels-photo-3685530.jpeg",
                "100ml",
                Arrays.asList("Deep cleansing", "Pore tightening", "Oil control", "Mineral nourishment"),
                Arrays.asList("Dead Sea Mud", "Kaolin Clay", "Aloe Vera", "Tea Tree Oil"),
                40
            ));

            beautyProductRepository.save(new BeautyProduct(
                "Gold Collagen Face Mask",
                "Luxury sheet mask infused with gold and collagen for instant glow.",
                new BigDecimal("25.00"),
                "masks",
                "https://images.pexels.com/photos/3685530/pexels-photo-3685530.jpeg",
                "1 sheet",
                Arrays.asList("Instant glow", "Skin firming", "Hydration boost", "Luxury treatment"),
                Arrays.asList("24k Gold", "Marine Collagen", "Hyaluronic Acid", "Vitamin E"),
                100
            ));

            beautyProductRepository.save(new BeautyProduct(
                "Charcoal Detox Mask",
                "Deep cleansing charcoal mask for oily and acne-prone skin.",
                new BigDecimal("55.00"),
                "masks",
                "https://images.pexels.com/photos/3685530/pexels-photo-3685530.jpeg",
                "75ml",
                Arrays.asList("Deep detox", "Blackhead removal", "Oil control", "Pore cleansing"),
                Arrays.asList("Activated Charcoal", "Bentonite Clay", "Tea Tree Oil", "Salicylic Acid"),
                35
            ));
        }
            menuItemRepository.save(new MenuItem("Anticucho", "Peruvian-style marinated beef skewers", new BigDecimal("380.00"), "mains", "https://images.pexels.com/photos/357573/pexels-photo-357573.jpeg"));
            menuItemRepository.save(new MenuItem("Teriyaki Chicken", "Grilled chicken with teriyaki glaze and vegetables", new BigDecimal("320.00"), "mains", "https://images.pexels.com/photos/106343/pexels-photo-106343.jpeg"));
            menuItemRepository.save(new MenuItem("Salmon Teriyaki", "Grilled salmon with sweet teriyaki sauce", new BigDecimal("360.00"), "mains", "https://images.pexels.com/photos/725991/pexels-photo-725991.jpeg"));
            menuItemRepository.save(new MenuItem("Beef Short Rib", "Slow-cooked beef short rib with miso glaze", new BigDecimal("520.00"), "mains", "https://images.pexels.com/photos/357573/pexels-photo-357573.jpeg"));
            
            // Desserts
            menuItemRepository.save(new MenuItem("Chocolate Soufflé", "Warm chocolate soufflé with vanilla ice cream", new BigDecimal("180.00"), "desserts", "https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg"));
            menuItemRepository.save(new MenuItem("Green Tea Ice Cream", "Traditional matcha green tea ice cream", new BigDecimal("120.00"), "desserts", "https://images.pexels.com/photos/1352278/pexels-photo-1352278.jpeg"));
            menuItemRepository.save(new MenuItem("Bento Box Dessert", "Assortment of small Japanese desserts", new BigDecimal("220.00"), "desserts", "https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg"));
            menuItemRepository.save(new MenuItem("Mochi Ice Cream", "Traditional Japanese rice cake with ice cream", new BigDecimal("140.00"), "desserts", "https://images.pexels.com/photos/1352278/pexels-photo-1352278.jpeg"));
            menuItemRepository.save(new MenuItem("Cheesecake Tempura", "Deep-fried cheesecake with berry sauce", new BigDecimal("160.00"), "desserts", "https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg"));
            menuItemRepository.save(new MenuItem("Yuzu Tart", "Citrus tart with yuzu cream and meringue", new BigDecimal("150.00"), "desserts", "https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg"));
            
            // Boissons / Beverages
            menuItemRepository.save(new MenuItem("Sake Selection", "Premium sake tasting flight with tasting notes", new BigDecimal("350.00"), "beverages", "https://images.pexels.com/photos/5946963/pexels-photo-5946963.jpeg"));
            menuItemRepository.save(new MenuItem("Nobu Signature Cocktail", "Signature cocktail with yuzu and sake", new BigDecimal("180.00"), "beverages", "https://images.pexels.com/photos/1304540/pexels-photo-1304540.jpeg"));
            menuItemRepository.save(new MenuItem("Japanese Whisky Flight", "Japanese whisky tasting selection", new BigDecimal("450.00"), "beverages", "https://images.pexels.com/photos/5946963/pexels-photo-5946963.jpeg"));
            menuItemRepository.save(new MenuItem("Premium Matcha Tea", "Traditional matcha tea ceremony", new BigDecimal("150.00"), "beverages", "https://images.pexels.com/photos/1352278/pexels-photo-1352278.jpeg"));
            menuItemRepository.save(new MenuItem("Plum Wine", "Sweet Japanese plum wine (Umeshu)", new BigDecimal("160.00"), "beverages", "https://images.pexels.com/photos/5946963/pexels-photo-5946963.jpeg"));
            menuItemRepository.save(new MenuItem("Green Tea", "Traditional Japanese green tea", new BigDecimal("80.00"), "beverages", "https://images.pexels.com/photos/1352278/pexels-photo-1352278.jpeg"));
            menuItemRepository.save(new MenuItem("Lychee Martini", "Vodka martini with fresh lychee", new BigDecimal("170.00"), "beverages", "https://images.pexels.com/photos/1304540/pexels-photo-1304540.jpeg"));
            menuItemRepository.save(new MenuItem("Sparkling Water", "Premium Japanese sparkling water", new BigDecimal("60.00"), "beverages", "https://images.pexels.com/photos/416528/pexels-photo-416528.jpeg"));
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
            System.out.println("✅ Activities initialized successfully!");
        }

        // Initialize beauty products
        System.out.println("🔍 Checking beauty products in database...");
        long beautyProductCount = beautyProductRepository.count();
        System.out.println("📊 Current beauty products count: " + beautyProductCount);
        
        if (beautyProductCount == 0) {
            System.out.println("🚀 Initializing beauty products...");
            
            // Essential Oils
            beautyProductRepository.save(new BeautyProduct(
                "Moroccan Argan Oil",
                "Pure organic argan oil from the Atlas Mountains, perfect for hair and skin nourishment.",
                new BigDecimal("85.00"),
                "essential-oils",
                "https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg",
                "50ml",
                Arrays.asList("Deep moisturizing", "Anti-aging properties", "Hair strengthening", "Skin repair"),
                Arrays.asList("100% Pure Argan Oil", "Vitamin E", "Essential Fatty Acids"),
                50
            ));

            beautyProductRepository.save(new BeautyProduct(
                "Lavender Essential Oil",
                "Calming lavender oil from French Provence, ideal for relaxation and aromatherapy.",
                new BigDecimal("65.00"),
                "essential-oils",
                "https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg",
                "30ml",
                Arrays.asList("Stress relief", "Better sleep", "Skin soothing", "Aromatherapy"),
                Arrays.asList("Pure Lavender Oil", "Natural Linalool", "Lavandyl Acetate"),
                30
            ));

            beautyProductRepository.save(new BeautyProduct(
                "Rose Hip Seed Oil",
        }
    }
}