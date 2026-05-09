package com.inkslot.mobile

import android.content.Intent
import android.content.SharedPreferences
import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.inkslot.mobile.model.LoginRequest
import com.inkslot.mobile.network.RetrofitClient
import kotlinx.coroutines.launch

class LoginActivity : AppCompatActivity() {

    private lateinit var etEmail: EditText
    private lateinit var etPassword: EditText
    private lateinit var btnLogin: Button
    private lateinit var tvError: TextView
    private lateinit var prefs: SharedPreferences

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_login)

        prefs = getSharedPreferences("inkslot_prefs", MODE_PRIVATE)

        // If already logged in, skip to dashboard
        if (prefs.getString("access_token", null) != null) {
            goToDashboard()
            return
        }

        etEmail    = findViewById(R.id.etEmail)
        etPassword = findViewById(R.id.etPassword)
        btnLogin   = findViewById(R.id.btnLogin)
        tvError    = findViewById(R.id.tvError)

        btnLogin.setOnClickListener { attemptLogin() }
    }

    private fun attemptLogin() {
        val email    = etEmail.text.toString().trim()
        val password = etPassword.text.toString()

        // Client-side validation
        if (email.isEmpty() || password.isEmpty()) {
            showError("Email and password are required")
            return
        }
        if (!android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
            showError("Please enter a valid email address")
            return
        }

        setLoading(true)

        lifecycleScope.launch {
            try {
                val response = RetrofitClient.apiService.login(
                    LoginRequest(email = email, password = password)
                )

                if (response.isSuccessful && response.body()?.success == true) {
                    val authData = response.body()!!.data!!

                    // Save token and user info
                    prefs.edit()
                        .putString("access_token",  authData.accessToken)
                        .putString("refresh_token", authData.refreshToken)
                        .putString("user_email",    authData.user.email)
                        .putString("user_name",     authData.user.fullName)
                        .putString("user_role",     authData.user.role)
                        .apply()

                    goToDashboard()
                } else {
                    val msg = response.body()?.message ?: "Login failed. Check your credentials."
                    showError(msg)
                }
            } catch (e: Exception) {
                showError("Cannot connect to server. Is your backend running?")
            } finally {
                setLoading(false)
            }
        }
    }

    private fun goToDashboard() {
        startActivity(Intent(this, DashboardActivity::class.java))
        finish()
    }

    private fun showError(message: String) {
        tvError.text = message
        tvError.visibility = View.VISIBLE
    }

    private fun setLoading(loading: Boolean) {
        btnLogin.isEnabled = !loading
        btnLogin.text = if (loading) "Signing in..." else "Log In"
    }
}
