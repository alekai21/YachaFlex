package com.example.yachaflex

import android.os.Bundle
import android.widget.TextView
import androidx.activity.ComponentActivity

class PermissionsRationaleActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val message = TextView(this).apply {
            text = "Yacha Flex reads heart rate from Health Connect only when you request it in the app."
            setPadding(32, 32, 32, 32)
        }

        setContentView(message)
    }
}
