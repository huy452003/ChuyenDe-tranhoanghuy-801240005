package com.vestshop.services;

import java.util.List;

import com.vestshop.enums.ProductStatus;
import com.vestshop.models.PageResponseModel;
import com.vestshop.models.ProductModel;

public interface ProductService {

    // Lấy danh sách sản phẩm
    List<ProductModel> getAllProducts();

    // Lấy danh sách sản phẩm có phân trang
    PageResponseModel<ProductModel> getAllProductsPaginated(int page, int size);

    // Lấy danh sách sản phẩm có phân trang với filter và sort
    PageResponseModel<ProductModel> getAllProductsPaginated(
        int page, int size, String category, Integer minPrice, Integer maxPrice, String sortBy
    );
    
    // Lấy danh sách sản phẩm có phân trang (cho admin)
    PageResponseModel<ProductModel> getAllProductsPaginatedAdmin(int page, int size);

    // Lấy danh sách sản phẩm có phân trang với filter và sort (cho admin)
    PageResponseModel<ProductModel> getAllProductsPaginatedAdmin(
        int page, int size, String searchTerm, String status, 
        Integer minPrice, Integer maxPrice, String sortBy, String sortOrder
    );

    // Lấy chi tiết sản phẩm theo ID
    ProductModel getProductById(Integer id);

    // Tạo sản phẩm mới
    ProductModel createProduct(ProductModel product);

    // Cập nhật sản phẩm
    ProductModel updateProduct(Integer id, ProductModel product);

    // Xóa sản phẩm
    void deleteProduct(Integer id);
    // Cập nhật trạng thái sản phẩm
    ProductModel updateProductStatus(Integer id, ProductStatus status);

    // Cập nhật tồn kho sản phẩm
    ProductModel updateProductStock(Integer id, Integer stock);
}
