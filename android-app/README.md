# YachaFlex - Android Health Connect App

App Android companion que lee datos biométricos de Health Connect y los envía al backend YachaFlex.

## Setup

### Dependencias (build.gradle :app)
```gradle
implementation "androidx.health.connect:connect-client:1.1.0-alpha07"
implementation "com.squareup.retrofit2:retrofit:2.11.0"
implementation "com.squareup.retrofit2:converter-gson:2.11.0"
```

### Permisos (AndroidManifest.xml)
```xml
<uses-permission android:name="android.permission.health.READ_HEART_RATE"/>
<uses-permission android:name="android.permission.health.READ_HEART_RATE_VARIABILITY"/>
<uses-permission android:name="android.permission.INTERNET"/>

<activity-alias
    android:name="ViewPermissionUsageActivity"
    android:exported="true"
    android:targetActivity=".MainActivity"
    android:permission="android.permission.START_VIEW_PERMISSION_USAGE">
    <intent-filter>
        <action android:name="android.intent.action.VIEW_PERMISSION_USAGE"/>
        <category android:name="android.intent.category.HEALTH_PERMISSIONS"/>
    </intent-filter>
</activity-alias>
```

## Código clave

### HealthConnectManager.kt
```kotlin
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.records.HeartRateRecord
import androidx.health.connect.client.records.HeartRateVariabilityRmssdRecord
import androidx.health.connect.client.request.ReadRecordsRequest
import androidx.health.connect.client.time.TimeRangeFilter
import java.time.Instant
import java.time.temporal.ChronoUnit

class HealthConnectManager(private val context: Context) {
    private val client = HealthConnectClient.getOrCreate(context)

    val permissions = setOf(
        HealthPermission.getReadPermission(HeartRateRecord::class),
        HealthPermission.getReadPermission(HeartRateVariabilityRmssdRecord::class),
    )

    suspend fun readBiometrics(): BiometricsData {
        val end = Instant.now()
        val start = end.minus(1, ChronoUnit.HOURS)
        val timeFilter = TimeRangeFilter.between(start, end)

        // Heart rate
        val hrRecords = client.readRecords(
            ReadRecordsRequest(HeartRateRecord::class, timeFilter)
        ).records
        val avgHr = hrRecords.flatMap { it.samples }.map { it.beatsPerMinute.toDouble() }
            .takeIf { it.isNotEmpty() }?.average()

        // HRV
        val hrvRecords = client.readRecords(
            ReadRecordsRequest(HeartRateVariabilityRmssdRecord::class, timeFilter)
        ).records
        val avgHrv = hrvRecords.map { it.heartRateVariabilityMillis }
            .takeIf { it.isNotEmpty() }?.average()

        return BiometricsData(heartRate = avgHr, hrv = avgHrv, activity = null)
    }
}

data class BiometricsData(
    val heartRate: Double?,
    val hrv: Double?,
    val activity: Double?
)
```

### ApiService.kt
```kotlin
import retrofit2.http.Body
import retrofit2.http.Header
import retrofit2.http.POST

interface ApiService {
    @POST("biometrics")
    suspend fun sendBiometrics(
        @Header("Authorization") token: String,
        @Body data: BiometricsData
    ): BiometricsResponse
}

data class BiometricsResponse(
    val stress_score: Double,
    val stress_level: String,
    val record_id: Int,
    val message: String
)
```

### MainActivity.kt (fragmento)
```kotlin
// URL del backend (ngrok o IP local)
private val BACKEND_URL = "https://TU-NGROK-URL.ngrok.io/"
private val JWT_TOKEN = "Bearer TU_TOKEN_JWT"  // guardar en SharedPreferences

private fun sendBiometrics() {
    lifecycleScope.launch {
        try {
            val data = healthConnectManager.readBiometrics()
            val response = apiService.sendBiometrics(JWT_TOKEN, data)
            Log.d("YachaFlex", "Stress updated: ${response.stress_level}")
        } catch (e: Exception) {
            Log.e("YachaFlex", "Error: ${e.message}")
        }
    }
}
```

## Flujo de uso

1. Usuario se registra/loguea en la **web** (guarda el JWT)
2. Usuario abre la **app Android** e ingresa el JWT (o la app redirige a login web)
3. La app lee HR y HRV de Health Connect cada **5 minutos**
4. POST a `/biometrics` → el backend recalcula el estrés con datos biométricos
5. El frontend web muestra los datos actualizados en tiempo real

## Variables de entorno en la app

Crear `local.properties`:
```
BACKEND_URL=https://TU-NGROK-URL.ngrok.io/
```

O hardcodear en `BuildConfig` via `build.gradle`:
```gradle
buildConfigField "String", "BACKEND_URL", '"https://TU-NGROK-URL.ngrok.io/"'
```
