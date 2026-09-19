package com.expensify.chat

import android.content.Context
import android.graphics.BitmapFactory
import android.media.MediaMetadataRetriever
import com.expensify.chat.intenthandler.IntentHandlerConstants
import com.facebook.react.bridge.Callback
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import android.util.Log
import com.facebook.react.bridge.ReactMethod
import org.json.JSONObject
import java.io.File

class ShareActionHandlerModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "ShareActionHandler"
    }

    @ReactMethod
    fun processFiles(callback: Callback) {
        try {
            val sharedPreferences = reactApplicationContext.getSharedPreferences(
                IntentHandlerConstants.preferencesFile,
                Context.MODE_PRIVATE
            )

            val shareObjectString = sharedPreferences.getString(IntentHandlerConstants.shareObjectProperty, null)
            if (shareObjectString == null) {
                callback.invoke(null)
                return
            }

            val shareObject = JSONObject(shareObjectString)
            val content = shareObject.optString("content")
            var mimeType = shareObject.optString("mimeType", "")
            val timestamp = System.currentTimeMillis()

            val file = File(content)
            if (file.exists() && (mimeType.isEmpty() || mimeType.endsWith("/*") || mimeType == "null")) {
                val extension = file.extension.lowercase()
                mimeType = android.webkit.MimeTypeMap.getSingleton().getMimeTypeFromExtension(extension) ?: mimeType
            }
            if (!file.exists() || file.length() == 0L) {
                if (mimeType.startsWith("text/") || mimeType == "txt") {
                    val textObject = JSONObject().apply {
                        put("id", "text")
                        put("content", content)
                        put("mimeType", "txt")
                        put("processedAt", timestamp)
                    }
                    callback.invoke(textObject.toString())
                    return
                }
                callback.invoke(null)
                return
            }

            val identifier = file.name
            var aspectRatio = 0.0f
            val fileUri = android.net.Uri.fromFile(file)
            val fileUriPath = fileUri.toString()

            if (mimeType.startsWith("image/")) {
                val options = BitmapFactory.Options().apply { inJustDecodeBounds = true }
                BitmapFactory.decodeFile(content, options)
                aspectRatio = if (options.outHeight != 0) options.outWidth.toFloat() / options.outHeight else 1.0f
            } else if (mimeType.startsWith("video/")) {
                val retriever = MediaMetadataRetriever()
                try {
                    retriever.setDataSource(content)
                    val videoWidth = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_WIDTH)?.toFloatOrNull() ?: 1f
                    val videoHeight = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_HEIGHT)?.toFloatOrNull() ?: 1f
                    if (videoHeight != 0f) aspectRatio = videoWidth / videoHeight
                } catch (e: Exception) {
                    Log.e("ShareActionHandlerModule", "Error retrieving video metadata: ${e.message}")
                } finally {
                    retriever.release()
                }
            }

            val fileData = JSONObject().apply {
                put("id", identifier)
                put("content", fileUriPath)
                put("mimeType", mimeType)
                put("processedAt", timestamp)
                put("aspectRatio", aspectRatio)
            }

            callback.invoke(fileData.toString())
            
        } catch (e: Exception) {
            Log.e("ShareActionHandlerModule", "Error processing shared files: ${e.message}", e)
            callback.invoke(null)
        }
    }
}
