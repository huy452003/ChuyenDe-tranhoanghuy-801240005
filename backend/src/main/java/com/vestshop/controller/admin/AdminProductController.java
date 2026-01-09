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
    public ResponseEntity<java.util.List<ProductModel>> getAllProducts() {
        java.util.List<ProductModel> products = productService.getAllProducts();
        return ResponseEntity.ok(products);
    }

    // Lấy sản phẩm theo ID (cho admin)
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<ProductModel> getProductById(@PathVariable Long id) {
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
            @PathVariable Long id,
            @Valid @RequestBody ProductModel productDTO
    ) {
        ProductModel updatedProduct = productService.updateProduct(id, productDTO);
        return ResponseEntity.ok(updatedProduct);
    }

    // Xóa sản phẩm
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    // Cập nhật trạng thái sản phẩm
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductModel> updateProductStatus(
            @PathVariable Long id,
            @RequestParam ProductStatus status
    ) {
        ProductModel updatedProduct = productService.updateProductStatus(id, status);
        return ResponseEntity.ok(updatedProduct);
    }

    // Cập nhật tồn kho
    @PatchMapping("/{id}/stock")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductModel> updateProductStock(
            @PathVariable Long id,
            @RequestParam Integer stock
    ) {
        ProductModel updatedProduct = productService.updateProductStock(id, stock);
        return ResponseEntity.ok(updatedProduct);
    }
}

