package com.margelo.nitro.utils

import android.content.Context
import android.graphics.BitmapFactory
import android.media.MediaMetadataRetriever
import android.net.Uri
import android.util.Log
import com.margelo.nitro.NitroModules
import com.margelo.nitro.core.Promise
import org.json.JSONObject
import java.io.File
import java.io.IOException

/** Reads the share that the host app's intent handler saved. The standalone app and HybridApp share this implementation. */
class HybridShareActionHandler : HybridShareActionHandlerSpec() {
    override val memorySize: Long = 0L

    override fun processFiles(): Promise<Array<SharedFile>> = Promise.parallel {
        val context = NitroModules.applicationContext ?: throw IllegalStateException("The React context is not available")
        val serializedShare = context.getSharedPreferences(PREFERENCES_FILE, Context.MODE_PRIVATE).getString(SHARE_OBJECT_PROPERTY, null)
        if (serializedShare == null) emptyArray() else arrayOf(createSharedFile(JSONObject(serializedShare), File(context.filesDir, SHARE_DIRECTORY_NAME)))
    }

    private fun createSharedFile(share: JSONObject, shareDirectory: File): SharedFile {
        val content = share.getString(CONTENT_KEY)
        val processedAt = System.currentTimeMillis().toString()
        val hasTypeMarker = share.has(IS_TEXT_KEY)
        if (hasTypeMarker && share.getBoolean(IS_TEXT_KEY)) {
            return SharedFile(TEXT_ID, content, TEXT_MIME_TYPE, processedAt, DEFAULT_ASPECT_RATIO)
        }

        // Shared text can be any path another app chooses, so only files inside the share folder are ever read.
        val file = SharedFileGuard.resolveInside(shareDirectory, content)
        if (file == null) {
            // A writer without isText cannot tell text from a file, so anything outside the share folder is returned as text.
            if (!hasTypeMarker) {
                return SharedFile(TEXT_ID, content, TEXT_MIME_TYPE, processedAt, DEFAULT_ASPECT_RATIO)
            }
            throw IOException("The shared file is missing, unreadable or outside the share folder")
        }

        val mimeType = share.optString(MIME_TYPE_KEY)
        return SharedFile(file.name, Uri.fromFile(file).toString(), mimeType, processedAt, getAspectRatio(file, mimeType))
    }

    private fun getAspectRatio(file: File, mimeType: String): Double {
        val (width, height) = when {
            mimeType.startsWith("image/") -> getImageSize(file)
            mimeType.startsWith("video/") -> getVideoSize(file)
            else -> null
        } ?: return DEFAULT_ASPECT_RATIO

        return if (width > 0 && height > 0) width / height else DEFAULT_ASPECT_RATIO
    }

    private fun getImageSize(file: File): Pair<Double, Double> {
        val options = BitmapFactory.Options().apply { inJustDecodeBounds = true }
        BitmapFactory.decodeFile(file.path, options)
        return options.outWidth.toDouble() to options.outHeight.toDouble()
    }

    private fun getVideoSize(file: File): Pair<Double, Double>? {
        val retriever = MediaMetadataRetriever()
        return try {
            retriever.setDataSource(file.path)
            val width = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_WIDTH)?.toDoubleOrNull()
            val height = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_HEIGHT)?.toDoubleOrNull()
            if (width != null && height != null) width to height else null
        } catch (e: RuntimeException) {
            Log.w(TAG, "Could not read the size of the shared video", e)
            null
        } finally {
            // The aspect ratio is optional, so a retriever that fails to close must not fail the share.
            runCatching { retriever.release() }
        }
    }

    companion object {
        private const val TAG = "HybridShareActionHandler"

        // The intent handlers in both host apps save the share under these names, see IntentHandlerConstants and ShareFileObject.
        private const val PREFERENCES_FILE = "shareActionHandler"
        private const val SHARE_OBJECT_PROPERTY = "shareObject"
        private const val CONTENT_KEY = "content"
        private const val MIME_TYPE_KEY = "mimeType"
        private const val IS_TEXT_KEY = "isText"
        private const val SHARE_DIRECTORY_NAME = "Expensify"

        private const val TEXT_ID = "text"
        private const val TEXT_MIME_TYPE = "txt"
        private const val DEFAULT_ASPECT_RATIO = 1.0
    }
}
