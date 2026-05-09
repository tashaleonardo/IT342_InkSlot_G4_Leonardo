package com.inkslot.mobile.network

import com.inkslot.mobile.model.ApiResponse
import com.inkslot.mobile.model.AuthResponse
import com.inkslot.mobile.model.LoginRequest
import com.inkslot.mobile.model.RegisterRequest
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.POST

interface ApiService {

    @POST("auth/login")
    suspend fun login(
        @Body request: LoginRequest
    ): Response<ApiResponse<AuthResponse>>

    @POST("auth/register")
    suspend fun register(
        @Body request: RegisterRequest
    ): Response<ApiResponse<AuthResponse>>
}
