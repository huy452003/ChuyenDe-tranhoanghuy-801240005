package com.vestshop.controller;

import java.util.List;

import com.vestshop.models.ProductModel;
import com.vestshop.services.ProductService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "http://localhost:3000")
public class ProductController {

    @Autowired
    private ProductService productService;

    // Lấy danh sách sản phẩm (public - không cần đăng nhập)
    @GetMapping
    public ResponseEntity<List<ProductModel>> getAllProducts(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Long minPrice,
            @RequestParam(required = false) Long maxPrice,
            @RequestParam(required = false) String status
    ) {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    // Lấy chi tiết sản phẩm theo ID (public - không cần đăng nhập)
    @GetMapping("/{id}")
    public ResponseEntity<ProductModel> getProductById(@PathVariable Long id) {
        ProductModel product = productService.getProductById(id);
        if (product == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(product);
    }


}

