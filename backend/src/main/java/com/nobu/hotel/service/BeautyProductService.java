package com.nobu.hotel.service;

import com.nobu.hotel.entity.BeautyProduct;
import com.nobu.hotel.repository.BeautyProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class BeautyProductService {

    @Autowired
    private BeautyProductRepository beautyProductRepository;

    public List<BeautyProduct> getAllBeautyProducts() {
        System.out.println("BeautyProductService: Getting all available beauty products");
        List<BeautyProduct> products = beautyProductRepository.findByAvailableTrue();
        System.out.println("BeautyProductService: Found " + products.size() + " available products");
        return products;
    }

    public List<BeautyProduct> getBeautyProductsByCategory(String category) {
        return beautyProductRepository.findByCategoryAndAvailableTrue(category);
    }

    public Optional<BeautyProduct> getBeautyProductById(Long id) {
        return beautyProductRepository.findById(id);
    }

    public BeautyProduct saveBeautyProduct(BeautyProduct beautyProduct) {
        return beautyProductRepository.save(beautyProduct);
    }

    public void deleteBeautyProduct(Long id) {
        beautyProductRepository.deleteById(id);
    }

    public List<BeautyProduct> getInStockProducts() {
        return beautyProductRepository.findByStockQuantityGreaterThan(0);
    }

    public boolean updateStock(Long productId, Integer quantity) {
        Optional<BeautyProduct> productOpt = beautyProductRepository.findById(productId);
        if (productOpt.isPresent()) {
            BeautyProduct product = productOpt.get();
            if (product.getStockQuantity() >= quantity) {
                product.setStockQuantity(product.getStockQuantity() - quantity);
                beautyProductRepository.save(product);
                return true;
            }
        }
        return false;
    }
}