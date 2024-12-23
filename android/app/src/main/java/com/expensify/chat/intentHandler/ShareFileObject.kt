package com.expensify.chat.intentHandler

import com.google.gson.Gson

data class ShareFileObject(val content: String, val mimeType: String?) {
    override fun toString(): String {
        return Gson().toJson(this)
    }
}
