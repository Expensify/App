package com.expensify.chat.intentHandler

import android.content.Context
import android.util.Log

object IntentHandlerFactory {
    fun getIntentHandler(context: Context, mimeType: String?, rest:String?): IntentHandler? {
        if (mimeType == null) return null
        Log.i("TextIntentHandler", mimeType)
        return when {
            mimeType.startsWith("image/") -> ImageIntentHandler(context)
            mimeType.startsWith("application/") -> ApplicationIntentHandler(context)
            mimeType.startsWith("text/") -> TextIntentHandler(context)
            Regex("audio/.*|video/.*").matches(mimeType) -> AudioVideoIntentHandler(context)
            else -> throw UnsupportedOperationException("Unsupported MIME type: $mimeType")
        }
    }
}