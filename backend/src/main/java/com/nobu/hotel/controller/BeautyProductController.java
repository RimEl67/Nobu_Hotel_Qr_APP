package com.nobu.hotel.controller;

import com.nobu.hotel.entity.BeautyProduct;
import com.nobu.hotel.service.BeautyProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/beauty-products")
@CrossOrigin(origins = "*")
public class BeautyProductController {

    @Autowired
    private BeautyProductService beautyProductService;

    @GetMapping
    public ResponseEntity<List<BeautyProduct>> getAllBeautyProducts() {
        System.out.println("GET /api/beauty-products - Fetching all beauty products");
        List<BeautyProduct> beautyProducts = beautyProductService.getAllBeautyProducts();
        System.out.println("Found " + beautyProducts.size() + " beauty products");
        return ResponseEntity.ok(beautyProducts);
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<BeautyProduct>> getBeautyProductsByCategory(@PathVariable String category) {
        List<BeautyProduct> beautyProducts = beautyProductService.getBeautyProductsByCategory(category);
        return ResponseEntity.ok(beautyProducts);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BeautyProduct> getBeautyProductById(@PathVariable Long id) {
        return beautyProductService.getBeautyProductById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/in-stock")
    public ResponseEntity<List<BeautyProduct>> getInStockProducts() {
        List<BeautyProduct> beautyProducts = beautyProductService.getInStockProducts();
        return ResponseEntity.ok(beautyProducts);
    }
}