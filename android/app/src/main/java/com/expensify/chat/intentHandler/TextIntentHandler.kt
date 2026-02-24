package com.expensify.chat.intenthandler

import android.content.Context
import android.content.Intent
import android.net.Uri
import com.expensify.chat.utils.FileUtils


class TextIntentHandler(private val context: Context) : AbstractIntentHandler() {
    override fun handle(intent: Intent): Boolean {
        super.clearTemporaryFiles(context)
        when(intent.action) {
            Intent.ACTION_SEND -> {
                handleTextIntent(intent, context)
                onCompleted()
                return true
            }
        }
        return false
    }

    private fun handleTextIntent(intent: Intent, context: Context) {
        when {
            intent.type == "text/plain" -> {
                val extras = intent.extras
                if (extras != null) {
                    when {
                        extras.containsKey(Intent.EXTRA_STREAM) -> {
                            handleTextFileIntent(intent, context)
                        }
                        extras.containsKey(Intent.EXTRA_TEXT) -> {
                            handleTextPlainIntent(intent, context)
                        }
                        else -> {
                            throw UnsupportedOperationException("Unknown text/plain content")
                        }
                    }
                }
            }
            Regex("text/.*").matches(intent.type ?: "") -> handleTextFileIntent(intent, context)
            else -> throw UnsupportedOperationException("Unsupported MIME type: ${intent.type}")
        }
    }
    
    private fun saveToSharedPreferences(key: String, value: String) {
        val sharedPreferences = context.getSharedPreferences(IntentHandlerConstants.preferencesFile, Context.MODE_PRIVATE)
        val editor = sharedPreferences.edit()
        editor.putString(key, value)
        editor.apply()
    }

    private fun handleTextFileIntent(intent: Intent, context: Context) {
        (intent.getParcelableExtra<Uri>(Intent.EXTRA_STREAM))?.let { fileUri ->
            val resultingPath: String? = FileUtils.copyUriToStorage(fileUri, context)
            if (resultingPath != null) {
                val shareFileObject = ShareFileObject(resultingPath, intent.type)
                saveToSharedPreferences(IntentHandlerConstants.shareObjectProperty, shareFileObject.toString())
            }
        }
    }

    private fun handleTextPlainIntent(intent: Intent, context: Context) {
            var intentTextContent = intent.getStringExtra(Intent.EXTRA_TEXT)
            if(intentTextContent != null) {
                val shareFileObject = ShareFileObject(intentTextContent, intent.type)
                saveToSharedPreferences(IntentHandlerConstants.shareObjectProperty, shareFileObject.toString())
            }
    }

    override fun onCompleted() {
        val uri: Uri = Uri.parse("new-expensify://share/root")
        val deepLinkIntent = Intent(Intent.ACTION_VIEW, uri)
        deepLinkIntent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
        context.startActivity(deepLinkIntent)
    }
}
