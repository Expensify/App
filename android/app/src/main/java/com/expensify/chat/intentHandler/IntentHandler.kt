package com.expensify.chat.intenthandler

import android.content.Intent

object IntentHandlerConstants {
    const val preferencesFile = "shareActionHandler"
    const val shareObjectProperty = "shareObject"
}
interface IntentHandler {
    fun handle(intent: Intent): Boolean
    fun onCompleted()
}
