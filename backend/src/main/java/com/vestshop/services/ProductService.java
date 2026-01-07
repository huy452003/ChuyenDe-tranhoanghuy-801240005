package com.vestshop.services;

import java.util.List;

import com.vestshop.enums.ProductStatus;
import com.vestshop.models.ProductModel;

public interface ProductService {

    // Lấy danh sách sản phẩm
    List<ProductModel> getAllProducts();
    // Lấy chi tiết sản phẩm theo ID
    ProductModel getProductById(Long id);
    // Tạo sản phẩm mới
    ProductModel createProduct(ProductModel product);
    // Cập nhật sản phẩm
    ProductModel updateProduct(Long id, ProductModel product);
    // Xóa sản phẩm
    void deleteProduct(Long id);
    // Cập nhật trạng thái sản phẩm
    ProductModel updateProductStatus(Long id, ProductStatus status);
    // Cập nhật tồn kho sản phẩm
    ProductModel updateProductStock(Long id, Integer stock);
}
