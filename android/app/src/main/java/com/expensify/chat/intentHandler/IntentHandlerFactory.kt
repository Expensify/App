package com.expensify.chat.intentHandler

import android.content.Context

object IntentHandlerFactory {
    fun getIntentHandler(context: Context, mimeType: String?, rest: String?): IntentHandler? {
        if (mimeType == null) return null

        return when {
            mimeType.matches(Regex("(image|application|audio|video)/.*")) -> FileIntentHandler(context)
            mimeType.startsWith("text/") -> TextIntentHandler(context)
            else -> throw UnsupportedOperationException("Unsupported MIME type: $mimeType")
        }
    }
}
