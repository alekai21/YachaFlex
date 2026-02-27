package com.example.yachaflex

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.PermissionController
import androidx.health.connect.client.permission.HealthPermission
import androidx.health.connect.client.records.HeartRateRecord
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.launch

class OnboardingActivity : ComponentActivity() {

    private val permissions = setOf(
        HealthPermission.getReadPermission(HeartRateRecord::class)
    )

    private val healthClient by lazy { HealthConnectClient.getOrCreate(this) }

    private val requestPermissionsLauncher = registerForActivityResult(
        PermissionController.createRequestPermissionResultContract()
    ) {
        finish()
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        lifecycleScope.launch {
            val granted = healthClient.permissionController.getGrantedPermissions()
            val missing = permissions - granted
            if (missing.isEmpty()) {
                finish()
            } else {
                requestPermissionsLauncher.launch(permissions)
            }
        }
    }
}
