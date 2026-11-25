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
        // A text share can carry a file, text or both. The file is used when it can be saved, and the text otherwise, so a broken attachment doesn't lose the text.
        val shareFileObject = saveSharedFile(intent, context) ?: getSharedText(intent)
        shareFileObject?.let { saveToSharedPreferences(IntentHandlerConstants.shareObjectProperty, it.toString()) }
    }
    
    private fun saveToSharedPreferences(key: String, value: String) {
        val sharedPreferences = context.getSharedPreferences(IntentHandlerConstants.preferencesFile, Context.MODE_PRIVATE)
        val editor = sharedPreferences.edit()
        editor.putString(key, value)
        editor.apply()
    }

    private fun saveSharedFile(intent: Intent, context: Context): ShareFileObject? {
        val fileUri = intent.getParcelableExtra<Uri>(Intent.EXTRA_STREAM)
        val resultingPath: String? = fileUri?.let { FileUtils.copyUriToStorage(it, context) }
        return resultingPath?.let { ShareFileObject.Attachment(it, intent.type) }
    }

    private fun getSharedText(intent: Intent): ShareFileObject? {
        // EXTRA_TEXT is a CharSequence, and senders such as AndroidX ShareCompat put styled text in it, which getStringExtra reads as null.
        // Blank text is dropped, so a share with no usable file or text shows the missing attachment error instead of an empty message.
        val text = intent.getCharSequenceExtra(Intent.EXTRA_TEXT)?.toString()
        return if (text.isNullOrBlank()) null else ShareFileObject.Text(text)
    }

    override fun onCompleted() {
        val uri: Uri = Uri.parse("new-expensify://share/root")
        val deepLinkIntent = Intent(Intent.ACTION_VIEW, uri)
        deepLinkIntent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
        context.startActivity(deepLinkIntent)
    }
}
