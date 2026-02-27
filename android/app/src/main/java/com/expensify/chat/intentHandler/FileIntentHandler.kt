package com.expensify.chat.intenthandler

import android.content.Context
import android.content.Intent
import android.net.Uri
import com.expensify.chat.utils.FileUtils

class FileIntentHandler(private val context: Context) : AbstractIntentHandler() {
    override fun handle(intent: Intent): Boolean {
        super.clearTemporaryFiles(context)
        when(intent.action) {
             Intent.ACTION_SEND -> {
                 handleSingleFileIntent(intent, context)
                 onCompleted()
                 return true
             }
         }
         return false
    }

    private fun handleSingleFileIntent(intent: Intent, context: Context) {
        (intent.getParcelableExtra<Uri>(Intent.EXTRA_STREAM))?.let { fileUri ->
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
