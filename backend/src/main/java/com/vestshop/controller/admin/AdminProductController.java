package com.vestshop.controller.admin;

import com.vestshop.enums.ProductStatus;
import com.vestshop.models.ProductModel;
import com.vestshop.services.ProductService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/products")
@CrossOrigin(origins = "http://localhost:3000")
@Validated
public class AdminProductController {

    @Autowired
    private ProductService productService;

    // Lấy tất cả sản phẩm (cho admin)
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<?> getAllProducts(
            @RequestParam(required = false) String searchTerm,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Integer minPrice,
            @RequestParam(required = false) Integer maxPrice,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String sortOrder,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size
    ) {
        // Nếu có page hoặc size, trả về paginated response với filter
        if (page != null || size != null) {
            int pageNum = page != null ? page : 0;
            int pageSize = size != null ? size : 10;
            return ResponseEntity.ok(productService.getAllProductsPaginatedAdmin(pageNum, pageSize, searchTerm, status, minPrice, maxPrice, sortBy, sortOrder));
        }
        // Nếu không có pagination params, trả về list như cũ
        return ResponseEntity.ok(productService.getAllProducts());
    }

    // Lấy sản phẩm theo ID (cho admin)
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<ProductModel> getProductById(@PathVariable Integer id) {
        ProductModel product = productService.getProductById(id);
        if (product == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(product);
    }

    // Tạo sản phẩm mới
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<ProductModel> createProduct(@Valid @RequestBody ProductModel productDTO) {
        ProductModel createdProduct = productService.createProduct(productDTO);
        return ResponseEntity.ok(createdProduct);
    }

    // Cập nhật sản phẩm
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductModel> updateProduct(
            @PathVariable Integer id,
            @Valid @RequestBody ProductModel productDTO
    ) {
        ProductModel updatedProduct = productService.updateProduct(id, productDTO);
        return ResponseEntity.ok(updatedProduct);
    }

    // Xóa sản phẩm
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteProduct(@PathVariable Integer id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    // Cập nhật trạng thái sản phẩm
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductModel> updateProductStatus(
            @PathVariable Integer id,
            @RequestParam ProductStatus status
    ) {
        ProductModel updatedProduct = productService.updateProductStatus(id, status);
        return ResponseEntity.ok(updatedProduct);
    }

    // Cập nhật tồn kho
    @PatchMapping("/{id}/stock")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductModel> updateProductStock(
            @PathVariable Integer id,
            @RequestParam Integer stock
    ) {
        ProductModel updatedProduct = productService.updateProductStock(id, stock);
        return ResponseEntity.ok(updatedProduct);
    }
}

