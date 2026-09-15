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
    private const val shareDirectoryName = "sharedFiles"

    private fun getShareStorageDirectory(context: Context): File {
        val shareStorageDirectory = File(context.filesDir.absolutePath, shareDirectoryName)
        if (!shareStorageDirectory.exists()) {
            shareStorageDirectory.mkdirs()
        }
        return shareStorageDirectory
    }

    fun clearInternalStorageDirectory(context: Context) {
        val shareStorageDirectory = getShareStorageDirectory(context)
        if (shareStorageDirectory.exists()) {
            val files = shareStorageDirectory.listFiles()
            if (files != null && files.isNotEmpty()) {
                for (file in files) {
                    file.delete()
                }
            } else {
                Log.i(tag, "No files found to delete in directory: ${shareStorageDirectory.absolutePath}")
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
            getShareStorageDirectory(context)
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
        val fileName = getFileName(context, fileUri) ?: generateFileName(context, fileUri)
        val destinationFile = File(getShareStorageDirectory(context), fileName)

        return try {
            saveFileFromProviderUri(fileUri, destinationFile, context)
            if (!destinationFile.exists() || destinationFile.length() == 0L) {
                destinationFile.delete()
                return null
            }
            destinationFile.absolutePath
        } catch (ex: Exception) {
            Log.e(tag, "Couldn't save file from intent", ex)
            null
        }
    }

    private fun generateFileName(context: Context, uri: Uri): String {
        val mimeTypeMap = MimeTypeMap.getSingleton()
        val mimeType = try {
            context.contentResolver.getType(uri)
        } catch (e: Exception) {
            null
        }
        val extension = if (mimeType != null) {
            mimeTypeMap.getExtensionFromMimeType(mimeType)
        } else {
            null
        } ?: "bin"
        return "${getUniqueFilePrefix()}.$extension"
    }

    private fun getFileName(context: Context, uri: Uri): String? {
        var name: String? = null
        try {
            val cursor = context.contentResolver.query(uri, null, null, null, null)
            cursor?.use {
                if (it.moveToFirst()) {
                    val nameIndex = it.getColumnIndex(OpenableColumns.DISPLAY_NAME)
                    if (nameIndex != -1) {
                        name = it.getString(nameIndex)
                    }
                }
            }
        } catch (e: Exception) {
            Log.w(tag, "Failed to query filename from ContentResolver", e)
        }
        return name
    }
}
