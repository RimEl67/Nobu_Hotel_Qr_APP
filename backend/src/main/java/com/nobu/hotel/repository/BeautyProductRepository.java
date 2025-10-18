package com.nobu.hotel.repository;

import com.nobu.hotel.entity.BeautyProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BeautyProductRepository extends JpaRepository<BeautyProduct, Long> {
    List<BeautyProduct> findByAvailableTrue();
    List<BeautyProduct> findByCategoryAndAvailableTrue(String category);
    List<BeautyProduct> findByCategory(String category);
    List<BeautyProduct> findByStockQuantityGreaterThan(Integer quantity);
}