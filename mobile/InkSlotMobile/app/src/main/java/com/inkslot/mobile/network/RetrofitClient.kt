package com.inkslot.mobile.network

import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

object RetrofitClient {

    // For Android Emulator: 10.0.2.2 points to your PC's localhost
    // For Physical Device: replace with your PC's local IP e.g. 192.168.1.10
    private const val BASE_URL = "http://10.0.2.2:8080/api/v1/"

    val apiService: ApiService by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(ApiService::class.java)
    }
}
