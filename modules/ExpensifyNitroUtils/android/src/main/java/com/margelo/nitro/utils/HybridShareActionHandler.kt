package com.margelo.nitro.utils

import android.content.Context
import android.graphics.BitmapFactory
import android.media.MediaMetadataRetriever
import android.net.Uri
import android.webkit.MimeTypeMap
import com.margelo.nitro.NitroModules
import com.margelo.nitro.core.Promise
import org.json.JSONObject
import java.io.File
import java.io.IOException
import java.util.Locale

/** Reads the same persisted share intent in standalone and hybrid builds. */
class HybridShareActionHandler : HybridShareActionHandlerSpec() {
    override val memorySize: Long = 0L

    override fun processFiles(): Promise<Array<SharedFile>> = Promise.parallel {
        val context = NitroModules.applicationContext ?: throw IOException("React Native context is unavailable")
        // Keep these values aligned with IntentHandlerConstants in
        // android/app/src/main/java/com/expensify/chat/intentHandler/IntentHandler.kt.
        // This standalone Nitro module cannot import app-level Android code.
        val preferences = context.getSharedPreferences("shareActionHandler", Context.MODE_PRIVATE)
        val serialized = preferences.getString("shareObject", null) ?: return@parallel emptyArray()
        val share = JSONObject(serialized)
        val content = share.opt("content") as? String ?: throw IOException("Shared content must be a string")
        if (content.isEmpty()) {
            throw IOException("Shared content is empty")
        }
        val file = File(content)
        val storedMimeType = share.opt("mimeType")
        if (storedMimeType != null && storedMimeType != JSONObject.NULL && storedMimeType !is String) {
            throw IOException("Shared MIME type must be a string")
        }
        var mimeType = (storedMimeType as? String).orEmpty().substringBefore(';').trim().lowercase(Locale.ROOT)
        val timestamp = System.currentTimeMillis().toString()

        // Older intent handlers did not distinguish literal text from a text file's path.
        val isText = if (share.has("isText")) {
            share.opt("isText") as? Boolean ?: throw IOException("Shared text discriminator must be a boolean")
        } else {
            mimeType == "text/plain" && !file.isAbsolute
        }
        if (isText) {
            return@parallel arrayOf(SharedFile("text", content, "txt", timestamp, null))
        }

        if (!file.isFile || !file.canRead()) {
            throw IOException("Shared attachment is missing or unreadable")
        }
        if (mimeType.isEmpty() || mimeType == "null" || mimeType.endsWith("/*")) {
            mimeType = MimeTypeMap.getSingleton().getMimeTypeFromExtension(file.extension.lowercase(Locale.ROOT))
                ?: "application/octet-stream"
        }

        val aspectRatio = when {
            mimeType.startsWith("image/") -> {
                val options = BitmapFactory.Options().apply { inJustDecodeBounds = true }
                BitmapFactory.decodeFile(content, options)
                if (options.outWidth > 0 && options.outHeight > 0) options.outWidth.toDouble() / options.outHeight else null
            }
            mimeType.startsWith("video/") -> {
                val retriever = MediaMetadataRetriever()
                try {
                    retriever.setDataSource(content)
                    val width = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_WIDTH)?.toDoubleOrNull()
                    val height = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_HEIGHT)?.toDoubleOrNull()
                    if (width != null && height != null && width > 0 && height > 0) width / height else null
                } finally {
                    retriever.release()
                }
            }
            else -> null
        }

        arrayOf(SharedFile(file.name, Uri.fromFile(file).toString(), mimeType, timestamp, aspectRatio))
    }
}
