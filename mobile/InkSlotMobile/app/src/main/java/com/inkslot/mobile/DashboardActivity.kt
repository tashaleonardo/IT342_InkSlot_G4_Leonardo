package com.inkslot.mobile

import android.content.Intent
import android.content.SharedPreferences
import android.os.Bundle
import android.widget.Button
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity

class DashboardActivity : AppCompatActivity() {

    private lateinit var prefs: SharedPreferences

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_dashboard)

        prefs = getSharedPreferences("inkslot_prefs", MODE_PRIVATE)

        val name  = prefs.getString("user_name",  "Artist") ?: "Artist"
        val email = prefs.getString("user_email", "") ?: ""
        val role  = prefs.getString("user_role",  "ARTIST") ?: "ARTIST"

        // Display first name only
        val firstName = name.split(" ").firstOrNull() ?: name
        findViewById<TextView>(R.id.tvWelcome).text = "Welcome back, $firstName!"
        findViewById<TextView>(R.id.tvEmail).text   = email
        findViewById<TextView>(R.id.tvRole).text    = role

        findViewById<Button>(R.id.btnLogout).setOnClickListener {
            // Clear saved session
            prefs.edit().clear().apply()
            startActivity(Intent(this, LoginActivity::class.java))
            finish()
        }
    }
}
