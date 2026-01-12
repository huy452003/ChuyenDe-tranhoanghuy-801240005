package com.vestshop.services.Imp;

import com.vestshop.services.ProductService;
import com.vestshop.services.ReviewService;
import com.vestshop.enums.ProductStatus;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import jakarta.persistence.criteria.Expression;
import com.vestshop.models.PageResponseModel;
import com.vestshop.models.ProductModel;
import com.vestshop.repository.ProductRepository;
import java.util.stream.Collectors;
import com.vestshop.entity.Product;
import org.modelmapper.ModelMapper;

import jakarta.persistence.criteria.Predicate;

@Service

public class ProductServiceImp implements ProductService{
    @Autowired
    private ProductRepository productRepo;
    @Autowired
    private ModelMapper modelMapper;
    @Autowired
    private ReviewService reviewService;
    
    @Override
    public List<ProductModel> getAllProducts() {
        List<Product> products = productRepo.findAll();
        return products.stream().map(
            product -> convertToModel(product)
        ).collect(Collectors.toList());
    }
    
    // Lấy danh sách sản phẩm có phân trang
    @Override
    public PageResponseModel<ProductModel> getAllProductsPaginated(int page, int size) {
        return getAllProductsPaginated(page, size, null, null, null, null);
    }
    
    // Lấy danh sách sản phẩm có phân trang với filter và sort
    @Override
    public PageResponseModel<ProductModel> getAllProductsPaginated(int page, int size, String category, Integer minPrice, Integer maxPrice, String sortBy) {
        // Kiểm tra page và size
        if (page < 0) page = 0;
        if (size < 1) size = 8; // Kích thước mặc định là 8
        
        // Xây dựng Specification cho việc lọc
        Specification<Product> spec = Specification.where(null);
        
        if (category != null && !category.isEmpty() && !category.equals("all")) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("category"), category));
        }
        
        if (minPrice != null || maxPrice != null) {
            spec = spec.and((root, query, cb) -> {
                // Lọc theo giá hiệu quả: sử dụng salePrice nếu tồn tại, nếu không thì sử dụng price
                // COALESCE(salePrice, price) BETWEEN minPrice AND maxPrice
                jakarta.persistence.criteria.Expression<Integer> effectivePrice = cb.coalesce(
                    root.get("salePrice"),
                    root.get("price")
                );
                
                Predicate pricePredicate = null;
                if (minPrice != null && maxPrice != null) {
                    pricePredicate = cb.between(effectivePrice, minPrice, maxPrice);
                } else if (minPrice != null) {
                    pricePredicate = cb.greaterThanOrEqualTo(effectivePrice, minPrice);
                } else if (maxPrice != null) {
                    pricePredicate = cb.lessThanOrEqualTo(effectivePrice, maxPrice);
                }
                return pricePredicate;
            });
        }
        
        // Xây dựng Sort
        Sort sort = Sort.by(Sort.Direction.ASC, "name"); // Sắp xếp theo tên mặc định
        if (sortBy != null && !sortBy.isEmpty()) {
            if (sortBy.equals("price-asc")) {
                // Sắp xếp theo salePrice nếu tồn tại, nếu không thì sắp xếp theo price
                sort = Sort.by(Sort.Direction.ASC, "salePrice", "price");
            } else if (sortBy.equals("price-desc")) {
                sort = Sort.by(Sort.Direction.DESC, "salePrice", "price");
            } else if (sortBy.equals("name")) {
                sort = Sort.by(Sort.Direction.ASC, "name");
            }
        }
        
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Product> productPage = productRepo.findAll(spec, pageable);
        
        // Chuyển đổi sang ProductModel
        List<ProductModel> content = productPage.getContent().stream()
            .map(product -> convertToModel(product))
            .collect(Collectors.toList());
        
        // Tạo PageResponse
        PageResponseModel<ProductModel> response = new PageResponseModel<>();
        response.setContent(content);
        response.setPage(productPage.getNumber());
        response.setSize(productPage.getSize());
        response.setTotalElements(productPage.getTotalElements());
        response.setTotalPages(productPage.getTotalPages());
        response.setFirst(productPage.isFirst());
        response.setLast(productPage.isLast());
        
        return response;
    }
    
    // Lấy danh sách sản phẩm có phân trang (cho admin)
    @Override
    public PageResponseModel<ProductModel> getAllProductsPaginatedAdmin(int page, int size) {
        return getAllProductsPaginatedAdmin(page, size, null, null, null, null, null, null);
    }
    
    // Lấy danh sách sản phẩm có phân trang với filter và sort (cho admin)
    @Override
    public PageResponseModel<ProductModel> getAllProductsPaginatedAdmin(int page, int size, String searchTerm, String status, Integer minPrice, Integer maxPrice, String sortBy, String sortOrder) {
        // Kiểm tra page và size
        if (page < 0) page = 0;
        if (size < 1) size = 10; // Kích thước mặc định là 10
        
        // Xây dựng Specification cho việc lọc
        Specification<Product> spec = Specification.where(null);
        
        // Lọc theo tên (tìm kiếm gần đúng)
        if (searchTerm != null && !searchTerm.trim().isEmpty()) {
            String searchLower = searchTerm.toLowerCase().trim();
            spec = spec.and((root, query, cb) -> 
                cb.like(cb.lower(root.get("name")), "%" + searchLower + "%")
            );
        }
        
        // Lọc theo trạng thái
        if (status != null && !status.isEmpty() && !status.equals("all")) {
            try {
                ProductStatus productStatus = ProductStatus.valueOf(status);
                spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), productStatus));
            } catch (IllegalArgumentException e) {
                // Invalid status, ignore
            }
        }
        
        // Lọc theo khoảng giá
        if (minPrice != null || maxPrice != null) {
            spec = spec.and((root, query, cb) -> {
                // Lọc theo giá hiệu quả: sử dụng salePrice nếu tồn tại, nếu không thì sử dụng price
                    Expression<Integer> effectivePrice = cb.coalesce(
                    root.get("salePrice"),
                    root.get("price")
                );
                
                Predicate pricePredicate = null;
                if (minPrice != null && maxPrice != null) {
                    pricePredicate = cb.between(effectivePrice, minPrice, maxPrice);
                } else if (minPrice != null) {
                    pricePredicate = cb.greaterThanOrEqualTo(effectivePrice, minPrice);
                } else if (maxPrice != null) {
                    pricePredicate = cb.lessThanOrEqualTo(effectivePrice, maxPrice);
                }
                return pricePredicate;
            });
        }
        
        // Xây dựng Sort
        Sort.Direction direction = (sortOrder != null && sortOrder.equalsIgnoreCase("desc")) 
            ? Sort.Direction.DESC 
            : Sort.Direction.ASC;
        
        Sort sort = Sort.by(direction, "name"); // Sắp xếp theo tên mặc định
        if (sortBy != null && !sortBy.isEmpty()) {
            if (sortBy.equals("price")) {
                // Sắp xếp theo salePrice nếu tồn tại, nếu không thì sắp xếp theo price
                sort = Sort.by(direction, "salePrice", "price");
            } else if (sortBy.equals("stock")) {
                sort = Sort.by(direction, "stock");
            } else if (sortBy.equals("status")) {
                sort = Sort.by(direction, "status");
            } else if (sortBy.equals("name")) {
                sort = Sort.by(direction, "name");
            }
        }
        
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Product> productPage = productRepo.findAll(spec, pageable);
        
        // Chuyển đổi sang ProductModel
        List<ProductModel> content = productPage.getContent().stream()
            .map(product -> convertToModel(product))
            .collect(Collectors.toList());
        
        // Tạo PageResponse
        PageResponseModel<ProductModel> response = new PageResponseModel<>();
        response.setContent(content);
        response.setPage(productPage.getNumber());
        response.setSize(productPage.getSize());
        response.setTotalElements(productPage.getTotalElements());
        response.setTotalPages(productPage.getTotalPages());
        response.setFirst(productPage.isFirst());
        response.setLast(productPage.isLast());
        
        return response;
    }

    // Lấy chi tiết sản phẩm theo ID
    @Override
    public ProductModel getProductById(Integer id) {
        Product product = productRepo.findById(id).orElse(null);
        if (product == null) {
            return null;
        }
        return convertToModel(product);
    }

    // Tạo sản phẩm mới
    @Override
    public ProductModel createProduct(ProductModel product) {
        Product productEntity = modelMapper.map(product, Product.class);
        
        // Tự động chuyển trạng thái dựa trên số tồn kho khi tạo mới
        if (productEntity.getStock() == null || productEntity.getStock() <= 0) {
            productEntity.setStatus(ProductStatus.OUT_OF_STOCK);
        } else if (productEntity.getStatus() == null) {
            productEntity.setStatus(ProductStatus.ACTIVE);
        }
        
        Product createdProduct = productRepo.save(productEntity);
        return convertToModel(createdProduct);
    }

    // Cập nhật sản phẩm
    @Override
    public ProductModel updateProduct(Integer id, ProductModel product) {
        // Lấy product hiện tại từ database để giữ các giá trị không được update
        Product existingProduct = productRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại"));
        
        Product productEntity = modelMapper.map(product, Product.class);
        productEntity.setId(id); // Set ID để update đúng record
        
        // Xử lý logic status và stock:
        // 1. Nếu stock = 0, bắt buộc phải là OUT_OF_STOCK (không thể bán khi hết hàng)
        if (productEntity.getStock() == null || productEntity.getStock() <= 0) {
            productEntity.setStatus(ProductStatus.OUT_OF_STOCK);
        } 
        // 2. Nếu stock > 0 và admin đã set status thủ công, giữ nguyên status đó
        // (Cho phép admin set OUT_OF_STOCK ngay cả khi còn stock - ví dụ: sản phẩm có lỗi, tạm ngừng bán)
        else if (productEntity.getStatus() != null) {
            // Admin đã set status thủ công, giữ nguyên
            // Chỉ validate: không cho phép ACTIVE khi stock = 0 (đã xử lý ở trên)
        }
        // 3. Nếu stock > 0 và admin không set status (null), tự động sync với stock
        else {
            // Nếu đang OUT_OF_STOCK và có stock mới > 0, tự động chuyển về ACTIVE
            if (existingProduct.getStatus() == ProductStatus.OUT_OF_STOCK) {
                productEntity.setStatus(ProductStatus.ACTIVE);
            } else {
                // Giữ nguyên status hiện tại
                productEntity.setStatus(existingProduct.getStatus());
            }
        }
        
        Product updatedProduct = productRepo.save(productEntity);
        return convertToModel(updatedProduct);
    }

    @Override
    public void deleteProduct(Integer id) {
        productRepo.deleteById(id);
    }

    // Cập nhật trạng thái sản phẩm
    @Override
    public ProductModel updateProductStatus(Integer id, ProductStatus status) {
        Product product = productRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại"));
        
        // Validation: Không cho phép set ACTIVE khi stock = 0
        if (status == ProductStatus.ACTIVE && (product.getStock() == null || product.getStock() <= 0)) {
            throw new RuntimeException("Không thể đặt trạng thái 'Đang bán' khi sản phẩm hết hàng (stock = 0)");
        }
        
        // Cho phép admin set bất kỳ status nào (ACTIVE, OUT_OF_STOCK, HIDDEN)
        // khi stock > 0, hoặc OUT_OF_STOCK/HIDDEN khi stock = 0
        product.setStatus(status);
        Product updatedProduct = productRepo.save(product);
        return convertToModel(updatedProduct);
    }

    // Cập nhật tồn kho sản phẩm
    @Override
    public ProductModel updateProductStock(Integer id, Integer stock) {
        Product product = productRepo.findById(id).orElse(null);
        if (product == null) {
            return null;
        }
        product.setStock(stock);
        
        // Tự động chuyển trạng thái dựa trên số tồn kho
        if (stock == null || stock <= 0) {
            product.setStatus(ProductStatus.OUT_OF_STOCK);
        } else if (product.getStatus() == ProductStatus.OUT_OF_STOCK) {
            // Nếu đang hết hàng và có stock mới > 0, chuyển về ACTIVE
            product.setStatus(ProductStatus.ACTIVE);
        }
        
        Product updatedProduct = productRepo.save(product);
        return convertToModel(updatedProduct);
    }
    
    // Chuyển đổi sản phẩm từ entity sang model với rating
    private ProductModel convertToModel(Product product) {
        ProductModel model = modelMapper.map(product, ProductModel.class);
        
        // Tính rating trung bình, số lượng đánh giá và số lượng đơn hàng đã thành công
        if (product.getId() != null) {
            try {
                Double averageRating = reviewService.getAverageRating(product.getId());
                Integer reviewCount = reviewService.getReviewCount(product.getId());
                model.setAverageRating(averageRating != null ? averageRating : 0.0);
                model.setReviewCount(reviewCount != null ? reviewCount : 0);
                
                model.setCompletedOrderCount(0);
            } catch (Exception e) {
                // Nếu có lỗi, set giá trị mặc định
                System.err.println("Error calculating rating for product " + product.getId() + ": " + e.getMessage());
                e.printStackTrace();
                model.setAverageRating(0.0);
                model.setReviewCount(0);
                model.setCompletedOrderCount(0);
            }
        } else {
            // Product chưa có ID (mới tạo), set giá trị mặc định
            model.setAverageRating(0.0);
            model.setReviewCount(0);
            model.setCompletedOrderCount(0);
        }
        
        return model;
    }
}
