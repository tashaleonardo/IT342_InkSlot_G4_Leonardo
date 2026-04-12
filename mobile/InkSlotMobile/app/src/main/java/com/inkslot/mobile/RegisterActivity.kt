package com.inkslot.mobile

import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.inkslot.mobile.model.RegisterRequest
import com.inkslot.mobile.network.RetrofitClient
import kotlinx.coroutines.launch

class RegisterActivity : AppCompatActivity() {

    private lateinit var etFullName: EditText
    private lateinit var etEmail: EditText
    private lateinit var etPassword: EditText
    private lateinit var btnRegister: Button
    private lateinit var tvError: TextView
    private lateinit var tvSuccess: TextView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_register)

        etFullName  = findViewById(R.id.etFullName)
        etEmail     = findViewById(R.id.etEmail)
        etPassword  = findViewById(R.id.etPassword)
        btnRegister = findViewById(R.id.btnRegister)
        tvError     = findViewById(R.id.tvError)
        tvSuccess   = findViewById(R.id.tvSuccess)

        btnRegister.setOnClickListener { attemptRegister() }

        findViewById<TextView>(R.id.tvGoToLogin).setOnClickListener {
            finish() // go back to LoginActivity
        }
    }

    private fun attemptRegister() {
        val fullName = etFullName.text.toString().trim()
        val email    = etEmail.text.toString().trim()
        val password = etPassword.text.toString()

        // Validation
        if (fullName.isEmpty() || email.isEmpty() || password.isEmpty()) {
            showError("All fields are required")
            return
        }
        if (!android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
            showError("Please enter a valid email address")
            return
        }
        if (password.length < 6) {
            showError("Password must be at least 6 characters")
            return
        }

        setLoading(true)
        tvError.visibility   = View.GONE
        tvSuccess.visibility = View.GONE

        lifecycleScope.launch {
            try {
                val response = RetrofitClient.apiService.register(
                    RegisterRequest(
                        email    = email,
                        password = password,
                        fullName = fullName
                    )
                )

                if (response.isSuccessful && response.body()?.success == true) {
                    tvSuccess.text       = "Account created! You can now log in."
                    tvSuccess.visibility = View.VISIBLE
                    // Clear fields
                    etFullName.text.clear()
                    etEmail.text.clear()
                    etPassword.text.clear()
                } else {
                    val msg = response.body()?.message ?: "Registration failed. Email may already be in use."
                    showError(msg)
                }
            } catch (e: Exception) {
                showError("Cannot connect to server. Is your backend running?")
            } finally {
                setLoading(false)
            }
        }
    }

    private fun showError(message: String) {
        tvError.text       = message
        tvError.visibility = View.VISIBLE
    }

    private fun setLoading(loading: Boolean) {
        btnRegister.isEnabled = !loading
        btnRegister.text = if (loading) "Creating..." else "Create Account"
    }
}
