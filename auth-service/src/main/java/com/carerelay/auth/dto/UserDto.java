package com.carerelay.auth.dto;

import com.carerelay.auth.entity.User;
import com.carerelay.auth.entity.UserRole;

import java.util.UUID;

public record UserDto(
    UUID id,
    String email,
    String firstName,
    String lastName,
    UserRole role,
    String department
) {
    public static UserDto fromEntity(User user) {
        return new UserDto(
            user.getId(),
            user.getEmail(),
            user.getFirstName(),
            user.getLastName(),
            user.getRole(),
            user.getDepartment()
        );
    }
}
