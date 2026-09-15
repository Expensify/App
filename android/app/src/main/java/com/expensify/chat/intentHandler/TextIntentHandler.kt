package com.expensify.chat.intenthandler

import android.content.Context
import android.content.Intent
import android.net.Uri
import com.expensify.chat.utils.FileUtils


class TextIntentHandler(private val context: Context) : AbstractIntentHandler() {
    override fun handle(intent: Intent, shouldLaunchActivity: Boolean): Boolean {
        super.clearTemporaryFiles(context)
        when(intent.action) {
            Intent.ACTION_SEND -> {
                super.clearTemporaryFiles(context)
                if (!handleTextIntent(intent, context, shouldLaunchActivity)) {
                    return false
                }
                if (shouldLaunchActivity) {
                    onCompleted()
                }
                return true
            }
        }
        return false
    }

    private fun handleTextIntent(intent: Intent, context: Context, shouldLaunchActivity: Boolean): Boolean {
        when {
            intent.type == "text/plain" -> {
                val extras = intent.extras
                if (extras != null) {
                    return when {
                        extras.containsKey(Intent.EXTRA_STREAM) -> {
                            handleTextFileIntent(intent, context, shouldLaunchActivity)
                        }
                        extras.containsKey(Intent.EXTRA_TEXT) -> {
                            handleTextPlainIntent(intent, context, shouldLaunchActivity)
                        }
                        else -> {
                            throw UnsupportedOperationException("Unknown text/plain content")
                        }
                    }
                }
                return false
            }
            Regex("text/.*").matches(intent.type ?: "") -> return handleTextFileIntent(intent, context, shouldLaunchActivity)
            else -> throw UnsupportedOperationException("Unsupported MIME type: ${intent.type}")
        }
    }
    
    private fun saveToSharedPreferences(key: String, value: String, shouldLaunchActivity: Boolean): Boolean {
        val sharedPreferences = context.getSharedPreferences(IntentHandlerConstants.preferencesFile, Context.MODE_PRIVATE)
        val editor = sharedPreferences.edit()
        editor.putString(key, value)
        if (shouldLaunchActivity) {
            editor.apply()
            return true
        }

        return editor.commit()
    }

    private fun handleTextFileIntent(intent: Intent, context: Context, shouldLaunchActivity: Boolean): Boolean {
        val fileUri = intent.getParcelableExtra<Uri>(Intent.EXTRA_STREAM) ?: return false
        val resultingPath = FileUtils.copyUriToStorage(fileUri, context) ?: return false
        val mimeType = try {
            context.contentResolver.getType(fileUri)
        } catch (exception: Exception) {
            null
        } ?: intent.type
        val shareFileObject = ShareFileObject(resultingPath, mimeType)
        return saveToSharedPreferences(IntentHandlerConstants.shareObjectProperty, shareFileObject.toString(), shouldLaunchActivity)
    }

    private fun handleTextPlainIntent(intent: Intent, context: Context, shouldLaunchActivity: Boolean): Boolean {
        val intentTextContent = intent.getStringExtra(Intent.EXTRA_TEXT) ?: return false
        val shareFileObject = ShareFileObject(intentTextContent, intent.type)
        return saveToSharedPreferences(IntentHandlerConstants.shareObjectProperty, shareFileObject.toString(), shouldLaunchActivity)
    }

    override fun onCompleted() {
        val uri: Uri = Uri.parse("new-expensify://share/root")
        val deepLinkIntent = Intent(Intent.ACTION_VIEW, uri)
        deepLinkIntent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
        context.startActivity(deepLinkIntent)
    }
}
