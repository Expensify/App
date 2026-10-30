package com.expensify.chat.intenthandler

import android.content.Context
import android.content.Intent
import android.net.Uri
import com.expensify.chat.utils.FileUtils

class FileIntentHandler(private val context: Context) : AbstractIntentHandler() {
    override fun handle(intent: Intent, shouldLaunchActivity: Boolean): Boolean {
        super.clearTemporaryFiles(context)
        when(intent.action) {
             Intent.ACTION_SEND -> {
                 saveSharedFile(intent, context, shouldLaunchActivity)
                 // Expected persistence failures return from saveSharedFile(), allowing the warm-start Share screen to display an attachment error.
                 // Cold starts use new-expensify://share/root as the activity's initial URL instead.
                 if (shouldLaunchActivity) {
                     onCompleted()
                 }
                 return true
             }
         }
         return false
    }

    private fun saveSharedFile(intent: Intent, context: Context, shouldLaunchActivity: Boolean) {
        val fileUri = intent.getParcelableExtra<Uri>(Intent.EXTRA_STREAM) ?: return
        val resultingPath = FileUtils.copyUriToStorage(fileUri, context) ?: return
        val shareFileObject = ShareFileObject(resultingPath, intent.type)

        val sharedPreferences = context.getSharedPreferences(IntentHandlerConstants.preferencesFile, Context.MODE_PRIVATE)
        val editor = sharedPreferences.edit()
        editor.putString(IntentHandlerConstants.shareObjectProperty, shareFileObject.toString())
        if (shouldLaunchActivity) {
            editor.apply()
            return
        }

        editor.commit()
    }

    override fun onCompleted() {
        val uri: Uri = Uri.parse("new-expensify://share/root")
        val deepLinkIntent = Intent(Intent.ACTION_VIEW, uri)
        deepLinkIntent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
        context.startActivity(deepLinkIntent)
    }
}
