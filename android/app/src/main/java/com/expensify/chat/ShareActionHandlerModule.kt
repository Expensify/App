package com.expensify.chat

import android.content.Context
import android.graphics.BitmapFactory
import com.expensify.chat.intentHandler.IntentHandlerConstants
import com.facebook.react.bridge.Callback
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import org.json.JSONObject
import java.io.File

class ShareActionHandlerModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "ShareActionHandlerModule"
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
                callback.invoke("No data found", null)
                return
            }

            val shareObject = JSONObject(shareObjectString)
            val imagePath = shareObject.optString("content")
            val mimeType = shareObject.optString("mimeType")
            val fileUriPath = "file://$imagePath"

            val imageFile = File(imagePath)
            if (!imageFile.exists()) {
                callback.invoke("File does not exist", null)
                return
            }

            val timestamp = System.currentTimeMillis()
            val identifier = imageFile.name

            val options = BitmapFactory.Options().apply { inJustDecodeBounds = true }
            BitmapFactory.decodeFile(imagePath, options)
            val aspectRatio = if (options.outHeight != 0) options.outWidth.toFloat() / options.outHeight else 0.0f

            val result = JSONObject().apply {
                put("id", identifier)
                put("content", fileUriPath)
                put("mimeType", mimeType)
                put("processedAt", timestamp)
                put("aspectRatio", aspectRatio)
            }

            callback.invoke(result.toString())

        } catch (e: Exception) {
            callback.invoke(e.toString(), null)
        }
    }
}