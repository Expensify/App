package com.expensify.chat.intenthandler

import android.content.Context
import android.content.Intent
import android.net.Uri
import com.expensify.chat.utils.FileUtils

class FileIntentHandler(private val context: Context) : AbstractIntentHandler() {
    override fun handle(intent: Intent, shouldLaunchActivity: Boolean): Boolean {
        when(intent.action) {
             Intent.ACTION_SEND -> {
                 super.clearTemporaryFiles(context)
                 if (!handleSingleFileIntent(intent, context, shouldLaunchActivity)) {
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

    private fun handleSingleFileIntent(intent: Intent, context: Context, shouldLaunchActivity: Boolean): Boolean {
        val fileUri = intent.getParcelableExtra<Uri>(Intent.EXTRA_STREAM) ?: return false
        val resultingPath = FileUtils.copyUriToStorage(fileUri, context) ?: return false
        val mimeType = try {
            context.contentResolver.getType(fileUri)
        } catch (exception: Exception) {
            null
        } ?: intent.type
        val shareFileObject = ShareFileObject(resultingPath, mimeType)

        val sharedPreferences = context.getSharedPreferences(IntentHandlerConstants.preferencesFile, Context.MODE_PRIVATE)
        val editor = sharedPreferences.edit()
        editor.putString(IntentHandlerConstants.shareObjectProperty, shareFileObject.toString())
        if (shouldLaunchActivity) {
            editor.apply()
            return true
        }

        return editor.commit()
    }

    override fun onCompleted() {
        val uri: Uri = Uri.parse("new-expensify://share/root")
        val deepLinkIntent = Intent(Intent.ACTION_VIEW, uri)
        deepLinkIntent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
        context.startActivity(deepLinkIntent)
    }
}
