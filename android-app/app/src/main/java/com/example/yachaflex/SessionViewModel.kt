package com.example.yachaflex

import androidx.lifecycle.ViewModel

class SessionViewModel : ViewModel() {
    var endpoint: String? = null
    var authToken: String? = null
    var payloadJson: String? = null
    var summaryText: String? = null

    fun clearSession() {
        endpoint = null
        authToken = null
        payloadJson = null
        summaryText = null
    }
}
