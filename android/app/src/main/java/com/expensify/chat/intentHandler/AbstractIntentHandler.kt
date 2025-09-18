package com.expensify.chat.intenthandler

import android.content.Context
import com.expensify.chat.utils.FileUtils.clearInternalStorageDirectory

abstract class AbstractIntentHandler: IntentHandler {
    override fun onCompleted() {}

    protected fun clearTemporaryFiles(context: Context) {
        // Clear data present in the shared preferences
        val sharedPreferences = context.getSharedPreferences(IntentHandlerConstants.preferencesFile, Context.MODE_PRIVATE)
        val editor = sharedPreferences.edit()
        editor.clear()
        editor.apply()

        // Clear leftover temporary files from previous share attempts
        clearInternalStorageDirectory(context)
    }
}
