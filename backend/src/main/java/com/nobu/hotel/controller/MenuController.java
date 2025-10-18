package com.nobu.hotel.controller;

import com.nobu.hotel.entity.MenuItem;
import com.nobu.hotel.service.MenuService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/menu")
@CrossOrigin(origins = "*")
public class MenuController {

    @Autowired
    private MenuService menuService;

    @GetMapping
    public ResponseEntity<List<MenuItem>> getAllMenuItems() {
        List<MenuItem> menuItems = menuService.getAllMenuItems();
        return ResponseEntity.ok(menuItems);
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<MenuItem>> getMenuItemsByCategory(@PathVariable String category) {
        List<MenuItem> menuItems = menuService.getMenuItemsByCategory(category);
        return ResponseEntity.ok(menuItems);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MenuItem> getMenuItemById(@PathVariable Long id) {
        return menuService.getMenuItemById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}