package com.expensify.chat.intenthandler

import org.json.JSONObject

/** HybridShareActionHandler in @expensify/nitro-utils reads this JSON back, so its keys must stay in sync with that reader. */
sealed class ShareFileObject(private val content: String, private val mimeType: String?, private val isText: Boolean) {
    class Attachment(path: String, mimeType: String?) : ShareFileObject(path, mimeType, isText = false)

    class Text(text: String) : ShareFileObject(text, mimeType = null, isText = true)

    override fun toString(): String {
        return JSONObject().apply {
            put("content", content)
            put("mimeType", mimeType)
            put("isText", isText)
        }.toString()
    }
}
