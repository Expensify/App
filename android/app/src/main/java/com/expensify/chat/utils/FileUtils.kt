package com.expensify.chat.utils

import android.content.Context
import android.net.Uri
import android.util.Log
import android.webkit.MimeTypeMap
import java.io.File
import java.io.FileOutputStream
import java.io.IOException
import java.io.InputStream
import java.io.OutputStream

object FileUtils {
    private const val tag = "FileUtils"
    private const val directoryName = "Expensify"

    private fun getInternalStorageDirectory(context: Context): File {
        val internalStorageDirectory = File(context.filesDir.absolutePath, directoryName)
        if (!internalStorageDirectory.exists()) {
            internalStorageDirectory.mkdir()
        }
        return internalStorageDirectory
    }

    fun clearInternalStorageDirectory(context: Context) {
        val internalStorageDirectory = File(context.filesDir.absolutePath, directoryName)
        if (internalStorageDirectory.exists()) {
            val files = internalStorageDirectory.listFiles()
            for (file in files) {
                file.delete()
            }
        }
    }

    /**
     * Creates a temporary file in the internal storage.
     *
     * @return unique file prefix
     */
    fun getUniqueFilePrefix(): String {
        return System.currentTimeMillis().toString()
    }

    /**
     * Synchronous method
     *
     * @param fileUri
     * @param destinationFile
     * @param context
     * @throws IOException
     */
    @Throws(IOException::class)
    fun saveFileFromProviderUri(fileUri: Uri?, destinationFile: File?, context: Context) {
        val inputStream: InputStream? = fileUri?.let { context.contentResolver.openInputStream(it) }
        val outputStream: OutputStream = FileOutputStream(destinationFile)
        inputStream?.use { input ->
            outputStream.use { output ->
                input.copyTo(output)
            }
        }
    }

    /**
     * Creates a temporary image file in the internal storage.
     *
     * @param uri
     * @param context
     * @return
     * @throws IOException
     */
    @Throws(IOException::class)
    fun createTemporaryFile(uri: Uri?, context: Context): File {

        val mimeTypeMap = MimeTypeMap.getSingleton()

        val fileExtension = uri?.let {
            ".${mimeTypeMap.getExtensionFromMimeType(context.contentResolver.getType(it))}"
        } ?: throw IllegalArgumentException("URI must not be null")

        val file: File = File.createTempFile(
            getUniqueFilePrefix(),
            fileExtension,
            getInternalStorageDirectory(context)
        )

        Log.i(tag, "Created a temporary file at" + file.absolutePath)
        return file
    }

    /**
     * Copy the given Uri to storage
     *
     * @param uri
     * @param context
     * @return The absolute path of the image
     */
    fun copyUriToStorage(uri: Uri?, context: Context): String? {
        lateinit var resultingPath: String
        try {
            val imageFile: File = createTemporaryFile(uri, context)
            saveFileFromProviderUri(uri, imageFile, context)
            resultingPath = imageFile.absolutePath
            Log.i(tag, "save image$resultingPath")

        } catch (ex: IOException) {
            Log.e(tag, "Couldn't save image from intent", ex)
        }
        return resultingPath
    }
}