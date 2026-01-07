package com.vestshop;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class VestShopApplication {

    public static void main(String[] args) {
        SpringApplication.run(VestShopApplication.class, args);
        System.out.println("\n========================================");
        System.out.println("Vest Shop Backend is running!");
        System.out.println("API: http://localhost:9090");
    }
}

