package com.example.yachaflex

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.widget.Button
import android.widget.TextView
import androidx.activity.ComponentActivity
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.core.content.ContextCompat
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.PermissionController
import androidx.health.connect.client.permission.HealthPermission
import androidx.health.connect.client.records.HeartRateRecord
import androidx.health.connect.client.request.ReadRecordsRequest
import androidx.health.connect.client.time.TimeRangeFilter
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONArray
import org.json.JSONObject
import java.time.Instant
import java.time.ZoneId
import java.time.format.DateTimeFormatter
import java.time.temporal.ChronoUnit
import java.util.Locale

class MainActivity : ComponentActivity() {

    private lateinit var scanQrButton: Button
    private lateinit var sendButton: Button
    private lateinit var statusText: TextView
    private lateinit var hrSummaryText: TextView
    private lateinit var endpointDebugText: TextView

    private val providerPackageName = "com.google.android.apps.healthdata"
    private val readPermissions = setOf(
        HealthPermission.getReadPermission(HeartRateRecord::class)
    )
    private val timeFormatter = DateTimeFormatter.ofPattern("HH:mm:ss")
        .withZone(ZoneId.systemDefault())

    private val healthClient by lazy { HealthConnectClient.getOrCreate(this) }
    private val httpClient = OkHttpClient()
    private val sessionViewModel: SessionViewModel by viewModels()

    private val requestPermissionsLauncher = registerForActivityResult(
        PermissionController.createRequestPermissionResultContract()
    ) { grantedPermissions ->
        if (readPermissions.all { it in grantedPermissions }) {
            fetchLastHourHeartRate()
        } else {
            statusText.text = "Permission denied."
        }
    }

    private val scanQrLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (result.resultCode != RESULT_OK) {
            val error = result.data?.getStringExtra(QrScannerActivity.EXTRA_SCAN_ERROR)
            if (error.isNullOrBlank()) {
                setStatus("Ready to scan.")
            } else {
                setStatus(error, isError = true)
            }
            return@registerForActivityResult
        }

        val qrContent = result.data?.getStringExtra(QrScannerActivity.EXTRA_QR_CONTENT)
        if (qrContent.isNullOrBlank()) {
            setStatus("Scan failed.", isError = true)
            return@registerForActivityResult
        }

        processIncomingContent(qrContent, fromQr = true)
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        scanQrButton = findViewById(R.id.scanQrButton)
        sendButton = findViewById(R.id.sendButton)
        statusText = findViewById(R.id.statusText)
        hrSummaryText = findViewById(R.id.hrSummaryText)
        endpointDebugText = findViewById(R.id.endpointDebugText)

        scanQrButton.setOnClickListener {
            val intent = Intent(this, QrScannerActivity::class.java)
            scanQrLauncher.launch(intent)
        }

        sendButton.setOnClickListener {
            sendPayload()
        }

        renderState()
        handleDeepLinkIntent(intent)
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        handleDeepLinkIntent(intent)
    }

    private fun handleDeepLinkIntent(incomingIntent: Intent?) {
        if (incomingIntent?.action != Intent.ACTION_VIEW) {
            return
        }
        val raw = incomingIntent.dataString
        if (raw.isNullOrBlank()) {
            return
        }
        processIncomingContent(raw, fromQr = false)
        incomingIntent.data = null
    }

    private fun processIncomingContent(rawContent: String, fromQr: Boolean) {
        val endpoint = extractEndpointFromIncomingContent(rawContent)?.trim().orEmpty()
        if (endpoint.isBlank()) {
            setStatus("Scan failed.", isError = true)
            return
        }

        sessionViewModel.endpoint = endpoint
        sessionViewModel.payloadJson = null
        sessionViewModel.summaryText = null
        sendButton.isEnabled = false
        endpointDebugText.text = "Endpoint: $endpoint"
        setStatus(if (fromQr) "QR scanned successfully." else "Endpoint received.")
        fetchLastHourHeartRate()
    }

    private fun extractEndpointFromIncomingContent(rawContent: String): String? {
        val content = rawContent.trim()
        val uri = runCatching { Uri.parse(content) }.getOrNull() ?: return null

        val isCustomDeepLink = uri.scheme.equals("yachaflex", ignoreCase = true) &&
            uri.host.equals("connect", ignoreCase = true)
        val isHttpsDeepLink = uri.scheme.equals("https", ignoreCase = true) &&
            uri.host.equals("yachaflex.link", ignoreCase = true) &&
            uri.path?.startsWith("/connect") == true

        return if (isCustomDeepLink || isHttpsDeepLink) {
            uri.getQueryParameter("endpoint") ?: content
        } else {
            content
        }
    }

    private fun fetchLastHourHeartRate() {
        when (HealthConnectClient.getSdkStatus(this, providerPackageName)) {
            HealthConnectClient.SDK_UNAVAILABLE -> {
                setStatus("Health Connect unavailable.", isError = true)
                return
            }
            HealthConnectClient.SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED -> {
                setStatus("Update Health Connect.", isError = true)
                return
            }
            HealthConnectClient.SDK_AVAILABLE -> Unit
        }

        lifecycleScope.launch {
            try {
                val grantedPermissions = healthClient.permissionController.getGrantedPermissions()
                val missingPermissions = readPermissions - grantedPermissions
                if (missingPermissions.isNotEmpty()) {
                    requestPermissionsLauncher.launch(readPermissions)
                    return@launch
                }

                val result = withContext(Dispatchers.IO) { buildPayloadAndSummary() }
                sessionViewModel.payloadJson = result.payloadJson
                sessionViewModel.summaryText = result.summaryText
                sendButton.isEnabled = true
                setStatus("Ready to send.")
                renderState()
            } catch (se: SecurityException) {
                setStatus("Permission denied.", isError = true)
            } catch (e: Exception) {
                setStatus("Fetch failed.", isError = true)
            }
        }
    }

    private data class HeartRateFetchResult(
        val payloadJson: String,
        val summaryText: String
    )

    private suspend fun buildPayloadAndSummary(): HeartRateFetchResult {
        val windowEnd = Instant.now()
        val windowStart = windowEnd.minus(1, ChronoUnit.HOURS)

        val records = healthClient.readRecords(
            ReadRecordsRequest(
                HeartRateRecord::class,
                timeRangeFilter = TimeRangeFilter.between(windowStart, windowEnd)
            )
        ).records

        val samples = records
            .flatMap { it.samples }
            .sortedBy { it.time }

        val heartRateArray = JSONArray()
        samples.forEach { sample ->
            heartRateArray.put(
                JSONObject()
                    .put("time", sample.time.toString())
                    .put("bpm", sample.beatsPerMinute)
            )
        }

        val payloadJson = JSONObject()
            .put("window_start", windowStart.toString())
            .put("window_end", windowEnd.toString())
            .put("heart_rate", heartRateArray)
            .toString()

        val count = samples.size
        val minBpm = samples.minOfOrNull { it.beatsPerMinute }
        val maxBpm = samples.maxOfOrNull { it.beatsPerMinute }
        val avgBpm = if (count == 0) null else samples.map { it.beatsPerMinute }.average()
        val lastTen = samples.takeLast(10).reversed()

        val lastTenText = if (lastTen.isEmpty()) {
            "Last samples: (none)"
        } else {
            "Last samples:\n" + lastTen.joinToString("\n") { sample ->
                "${timeFormatter.format(sample.time)} - ${sample.beatsPerMinute} bpm"
            }
        }

        val summaryText = buildString {
            appendLine("Window start: ${windowStart}")
            appendLine("Window end: ${windowEnd}")
            appendLine("Sample count: $count")
            appendLine("Min bpm: ${minBpm ?: "-"}")
            appendLine("Max bpm: ${maxBpm ?: "-"}")
            appendLine("Avg bpm: ${avgBpm?.let { String.format(Locale.US, "%.1f", it) } ?: "-"}")
            append(lastTenText)
        }

        return HeartRateFetchResult(payloadJson, summaryText)
    }

    private fun sendPayload() {
        val endpoint = sessionViewModel.endpoint
        val payload = sessionViewModel.payloadJson
        if (endpoint.isNullOrBlank() || payload.isNullOrBlank()) {
            setStatus("Nothing to send.", isError = true)
            return
        }

        lifecycleScope.launch {
            try {
                val success = withContext(Dispatchers.IO) {
                    val body = payload.toRequestBody("application/json".toMediaType())
                    val request = Request.Builder()
                        .url(endpoint)
                        .post(body)
                        .build()
                    httpClient.newCall(request).execute().use { response ->
                        response.isSuccessful
                    }
                }

                if (success) {
                    sessionViewModel.clearSession()
                    renderState()
                    setStatus("Sent successfully.")
                } else {
                    sendButton.isEnabled = true
                    updateSendButtonVisualState(true)
                    setStatus("Send failed.", isError = true)
                }
            } catch (_: Exception) {
                sendButton.isEnabled = true
                updateSendButtonVisualState(true)
                setStatus("Send failed.", isError = true)
            }
        }
    }

    private fun renderState() {
        val isReadyToSend = !sessionViewModel.payloadJson.isNullOrBlank()
        sendButton.isEnabled = isReadyToSend
        updateSendButtonVisualState(isReadyToSend)
        hrSummaryText.text = sessionViewModel.summaryText ?: "No heart-rate data loaded."
        endpointDebugText.text = "Endpoint: ${sessionViewModel.endpoint ?: "(none)"}"
        if (sessionViewModel.endpoint == null && sessionViewModel.payloadJson == null) {
            setStatus("Ready to scan.")
        }
    }

    private fun updateSendButtonVisualState(isReadyToSend: Boolean) {
        if (isReadyToSend) {
            sendButton.setBackgroundResource(R.drawable.bg_button_ready)
            sendButton.setTextColor(ContextCompat.getColor(this, R.color.yf_text_on_brand))
            sendButton.textSize = 18f
        } else {
            sendButton.setBackgroundResource(R.drawable.bg_button_disabled)
            sendButton.setTextColor(ContextCompat.getColor(this, R.color.yf_button_disabled_text))
            sendButton.textSize = 17f
        }
    }

    private fun setStatus(message: String, isError: Boolean = false) {
        statusText.text = message
        if (isError) {
            statusText.setTextColor(ContextCompat.getColor(this, R.color.yf_error_text))
            statusText.setBackgroundResource(R.drawable.bg_status_error)
        } else {
            statusText.setTextColor(ContextCompat.getColor(this, R.color.yf_text_primary))
            statusText.setBackgroundResource(R.drawable.bg_status_normal)
        }
    }
}
