package com.expensify.chat.intentHandler

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.util.Log
import com.expensify.chat.utils.FileUtils


class ApplicationIntentHandler(private val context: Context) : AbstractIntentHandler() {
    override fun handle(intent: Intent): Boolean {
        super.clearTemporaryFiles(context)
        when(intent.action) {
            Intent.ACTION_SEND -> {
                handleApplicationIntent(intent, context)
                onCompleted()
                return true
            }
        }
        return false
    }

    private fun handleApplicationIntent(intent: Intent, context: Context) {
        (intent.getParcelableExtra<Uri>(Intent.EXTRA_STREAM))?.let { fileUri ->
            // Update UI to reflect image being shared
            if (fileUri == null) {
                return
            }
            Log.i("AppIntentHandler", "uri: $fileUri")

            val resultingPath: String? = FileUtils.copyUriToStorage(fileUri, context)
            if (resultingPath != null) {
                val shareFileObject = ShareFileObject(resultingPath, intent.type)

                val sharedPreferences = context.getSharedPreferences(IntentHandlerConstants.preferencesFile, Context.MODE_PRIVATE)
                val editor = sharedPreferences.edit()
                editor.putString(IntentHandlerConstants.shareObjectProperty, shareFileObject.toString())
                editor.apply()
            }
        }
    }


    override fun onCompleted() {
        val uri: Uri = Uri.parse("new-expensify://share/root")
        val deepLinkIntent = Intent(Intent.ACTION_VIEW, uri)
        deepLinkIntent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
        context.startActivity(deepLinkIntent)
    }

}