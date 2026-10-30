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
                saveSharedText(intent, context, shouldLaunchActivity)
                // Expected persistence failures return from saveSharedText(), allowing the warm-start Share screen to display an attachment error.
                // Cold starts use new-expensify://share/root as the activity's initial URL instead.
                if (shouldLaunchActivity) {
                    onCompleted()
                }
                return true
            }
        }
        return false
    }

    private fun saveSharedText(intent: Intent, context: Context, shouldLaunchActivity: Boolean) {
        when {
            intent.type == "text/plain" -> {
                val extras = intent.extras
                if (extras != null) {
                    when {
                        extras.containsKey(Intent.EXTRA_STREAM) -> {
                            saveSharedTextFile(intent, context, shouldLaunchActivity)
                        }
                        extras.containsKey(Intent.EXTRA_TEXT) -> {
                            saveSharedTextContent(intent, context, shouldLaunchActivity)
                        }
                        else -> {
                            throw UnsupportedOperationException("Unknown text/plain content")
                        }
                    }
                }
                return
            }
            Regex("text/.*").matches(intent.type ?: "") -> saveSharedTextFile(intent, context, shouldLaunchActivity)
            else -> throw UnsupportedOperationException("Unsupported MIME type: ${intent.type}")
        }
    }
    
    private fun saveToSharedPreferences(key: String, value: String, shouldLaunchActivity: Boolean) {
        val sharedPreferences = context.getSharedPreferences(IntentHandlerConstants.preferencesFile, Context.MODE_PRIVATE)
        val editor = sharedPreferences.edit()
        editor.putString(key, value)
        if (shouldLaunchActivity) {
            editor.apply()
            return
        }

        editor.commit()
    }

    private fun saveSharedTextFile(intent: Intent, context: Context, shouldLaunchActivity: Boolean) {
        val fileUri = intent.getParcelableExtra<Uri>(Intent.EXTRA_STREAM) ?: return
        val resultingPath = FileUtils.copyUriToStorage(fileUri, context) ?: return
        val shareFileObject = ShareFileObject(resultingPath, intent.type)
        saveToSharedPreferences(IntentHandlerConstants.shareObjectProperty, shareFileObject.toString(), shouldLaunchActivity)
    }

    private fun saveSharedTextContent(intent: Intent, context: Context, shouldLaunchActivity: Boolean) {
        val intentTextContent = intent.getStringExtra(Intent.EXTRA_TEXT) ?: return
        val shareFileObject = ShareFileObject(intentTextContent, intent.type)
        saveToSharedPreferences(IntentHandlerConstants.shareObjectProperty, shareFileObject.toString(), shouldLaunchActivity)
    }

    override fun onCompleted() {
        val uri: Uri = Uri.parse("new-expensify://share/root")
        val deepLinkIntent = Intent(Intent.ACTION_VIEW, uri)
        deepLinkIntent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
        context.startActivity(deepLinkIntent)
    }
}
