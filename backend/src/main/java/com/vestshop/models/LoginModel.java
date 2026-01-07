package com.vestshop.models;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record LoginModel(
    @NotBlank(message = "username không được để trống")
    @NotNull(message = "username không được để trống")
    String username,

    @NotBlank(message = "mật khẩu không được để trống")
    @NotNull(message = "mật khẩu không được để trống")
    String password
) {}
