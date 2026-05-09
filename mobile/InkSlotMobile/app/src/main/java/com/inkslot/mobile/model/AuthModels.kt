package com.inkslot.mobile.model

// ─── Request bodies ───

data class LoginRequest(
    val email: String,
    val password: String
)

data class RegisterRequest(
    val email: String,
    val password: String,
    val fullName: String,
    val role: String = "ARTIST"
)

// ─── Response bodies ───

data class UserResponse(
    val id: Long,
    val email: String,
    val fullName: String,
    val role: String,
    val profileImageUrl: String?,
    val bio: String?
)

data class AuthResponse(
    val user: UserResponse,
    val accessToken: String,
    val refreshToken: String
)
