package com.vestshop.services.Imp;

import com.vestshop.services.ProductService;
import com.vestshop.enums.ProductStatus;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.vestshop.models.ProductModel;
import com.vestshop.repository.ProductRepository;
import java.util.stream.Collectors;
import com.vestshop.entity.Product;
import org.modelmapper.ModelMapper;

@Service

public class ProductServiceImp implements ProductService{
    @Autowired
    private ProductRepository productRepo;
    @Autowired
    private ModelMapper modelMapper;
    
    @Override
    public List<ProductModel> getAllProducts() {
        List<Product> products = productRepo.findAll();
        return products.stream().map(
            product -> modelMapper.map(product, ProductModel.class)
        ).collect(Collectors.toList());
    }

    @Override
    public ProductModel getProductById(Long id) {
        Product product = productRepo.findById(id).orElse(null);
        if (product == null) {
            return null;
        }
        return modelMapper.map(product, ProductModel.class);
    }

    @Override
    public ProductModel createProduct(ProductModel product) {
        Product productEntity = modelMapper.map(product, Product.class);
        Product createdProduct = productRepo.save(productEntity);
        return modelMapper.map(createdProduct, ProductModel.class);
    }

    @Override
    public ProductModel updateProduct(Long id, ProductModel product) {
        Product productEntity = modelMapper.map(product, Product.class);
        productEntity.setId(id); // Set ID để update đúng record
        Product updatedProduct = productRepo.save(productEntity);
        return modelMapper.map(updatedProduct, ProductModel.class);
    }

    @Override
    public void deleteProduct(Long id) {
        productRepo.deleteById(id);
    }

    @Override
    public ProductModel updateProductStatus(Long id, ProductStatus status) {
        Product product = productRepo.findById(id).orElse(null);
        if (product == null) {
            return null;
        }
        product.setStatus(status);
        Product updatedProduct = productRepo.save(product);
        return modelMapper.map(updatedProduct, ProductModel.class);
    }

    @Override
    public ProductModel updateProductStock(Long id, Integer stock) {
        Product product = productRepo.findById(id).orElse(null);
        if (product == null) {
            return null;
        }
        product.setStock(stock);
        Product updatedProduct = productRepo.save(product);
        return modelMapper.map(updatedProduct, ProductModel.class);
    }   
}
