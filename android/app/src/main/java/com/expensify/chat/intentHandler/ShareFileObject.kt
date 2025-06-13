package com.expensify.chat.intenthandler

import org.json.JSONObject

data class ShareFileObject(
    val content: String,
    val mimeType: String?,
) {
    override fun toString(): String {
        return JSONObject().apply {
            put("content", content)
            put("mimeType", mimeType)
        }.toString()
    }
}
