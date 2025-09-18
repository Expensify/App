package com.expensify.chat.utils

import android.content.Context
import android.net.Uri
import android.provider.OpenableColumns
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
            internalStorageDirectory.mkdirs()
        }
        return internalStorageDirectory
    }

    fun clearInternalStorageDirectory(context: Context) {
        val internalStorageDirectory = getInternalStorageDirectory(context)
        if (internalStorageDirectory.exists()) {
            val files = internalStorageDirectory.listFiles()
            if (files != null && files.isNotEmpty()) {
                for (file in files) {
                    file.delete()
                }
            } else {
                Log.i(tag, "No files found to delete in directory: ${internalStorageDirectory.absolutePath}")
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
    fun saveFileFromProviderUri(fileUri: Uri, destinationFile: File?, context: Context) {
        val inputStream: InputStream? = context.contentResolver.openInputStream(fileUri)
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
    fun createTemporaryFile(uri: Uri, context: Context): File {

        val mimeTypeMap = MimeTypeMap.getSingleton()

        val fileExtension = ".${mimeTypeMap.getExtensionFromMimeType(context.contentResolver.getType(uri))}"

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
    fun copyUriToStorage(fileUri: Uri, context: Context): String? {
        val fileName = getFileName(context, fileUri) ?: return null
        val destinationFile = File(getInternalStorageDirectory(context), fileName)

        return try {
            saveFileFromProviderUri(fileUri, destinationFile, context)
            destinationFile.absolutePath
        } catch (ex: IOException) {
            Log.e(tag, "Couldn't save file from intent", ex)
            null
        }
    }

    private fun getFileName(context: Context, uri: Uri): String? {
        var name: String? = null
        val cursor = context.contentResolver.query(uri, null, null, null, null)
        cursor?.use {
            if (it.moveToFirst()) {
                val nameIndex = it.getColumnIndex(OpenableColumns.DISPLAY_NAME)
                if (nameIndex != -1) {
                    name = it.getString(nameIndex)
                }
            }
        }
        return name
    }
}
