package com.nobu.hotel;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan(basePackages = "com.nobu.hotel") // Active JwtProperties
public class HotelManagementApplication {
    public static void main(String[] args) {
        SpringApplication.run(HotelManagementApplication.class, args);
    }
}
