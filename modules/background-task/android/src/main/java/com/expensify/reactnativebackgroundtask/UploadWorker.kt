package com.expensify.reactnativebackgroundtask

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.work.CoroutineWorker
import androidx.work.Data
import androidx.work.ForegroundInfo
import androidx.work.WorkerParameters
import com.facebook.react.bridge.ReactApplicationContext
import android.util.Log
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody
import java.io.File

/**
 * Worker responsible for uploading a receipt file in the background.
 * It performs a multipart upload using OkHttp to mirror the RequestMoney payload.
 */
class UploadWorker(appContext: Context, params: WorkerParameters) : CoroutineWorker(appContext, params) {

    override suspend fun doWork(): Result = withContext(Dispatchers.IO) {
        val url = inputData.getString(KEY_URL) ?: return@withContext Result.failure()
        val rawFilePath = inputData.getString(KEY_FILE_PATH) ?: return@withContext Result.failure()
        // WorkManager cannot read "file://" URIs directly; normalize to a plain path so File() works.
        val filePath = rawFilePath.removePrefix("file://")
        val fileName = inputData.getString(KEY_FILE_NAME) ?: File(filePath).name
        val mimeType = inputData.getString(KEY_MIME_TYPE) ?: "application/octet-stream"
        val transactionId = inputData.getString(KEY_TRANSACTION_ID) ?: ""
        val fields = inputData.getKeyValueMap().filterKeys { it.startsWith(KEY_FIELD_PREFIX) }
        val headers = inputData.getKeyValueMap().filterKeys { it.startsWith(KEY_HEADER_PREFIX) }

        Log.d(TAG, "Starting UploadWorker for transactionId=$transactionId file=$filePath url=$url")
        setForeground(createForegroundInfo(transactionId))

        val file = File(filePath)
        if (!file.exists()) {
            Log.w(TAG, "UploadWorker file not found: $filePath")
            return@withContext Result.failure()
        }

        val bodyBuilder = MultipartBody.Builder().setType(MultipartBody.FORM)
        fields.forEach { (key, value) ->
            val fieldName = key.removePrefix(KEY_FIELD_PREFIX)
            bodyBuilder.addFormDataPart(fieldName, value.toString())
        }
        val fileRequestBody = RequestBody.create(mimeType.toMediaTypeOrNull(), file)
        bodyBuilder.addFormDataPart("receipt", fileName, fileRequestBody)

        val requestBuilder = Request.Builder().url(url).post(bodyBuilder.build())
        headers.forEach { (key, value) ->
            val headerName = key.removePrefix(KEY_HEADER_PREFIX)
            requestBuilder.addHeader(headerName, value.toString())
        }

        return@withContext try {
            val client = OkHttpClient()
            val response = client.newCall(requestBuilder.build()).execute()
            if (response.isSuccessful) {
                Log.d(TAG, "UploadWorker success transactionId=$transactionId")
                broadcastResult(success = true, code = response.code, transactionId = transactionId)
                Result.success()
            } else {
                val bodyString = response.body?.string()?.take(200) ?: "no_body"
                Log.w(TAG, "UploadWorker response failure code=${response.code} transactionId=$transactionId body=$bodyString")
                broadcastResult(success = false, code = response.code, transactionId = transactionId)
                Result.retry()
            }
        } catch (e: Exception) {
            Log.e(TAG, "UploadWorker exception transactionId=$transactionId", e)
            broadcastResult(success = false, code = -1, transactionId = transactionId, message = e.message ?: "Exception")
            Result.retry()
        }
    }

    override suspend fun getForegroundInfo(): ForegroundInfo {
        val notification = createNotification("Uploading receipt")
        return ForegroundInfo(NOTIFICATION_ID, notification)
    }

    private fun createForegroundInfo(transactionId: String): ForegroundInfo {
        val notification = createNotification("Uploading receipt $transactionId")
        return ForegroundInfo(NOTIFICATION_ID, notification)
    }

    private fun createNotification(contentText: String): Notification {
        val channelId = NOTIFICATION_CHANNEL_ID
        val channelName = "Receipt Uploads"
        val manager = applicationContext.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(channelId, channelName, NotificationManager.IMPORTANCE_LOW)
            manager.createNotificationChannel(channel)
        }
        return NotificationCompat.Builder(applicationContext, channelId)
            .setContentTitle("Uploading receipt")
            .setContentText(contentText)
            .setSmallIcon(android.R.drawable.stat_sys_upload)
            .setOngoing(true)
            .build()
    }

    companion object {
        const val KEY_URL = "upload_url"
        const val KEY_FILE_PATH = "upload_file_path"
        const val KEY_FILE_NAME = "upload_file_name"
        const val KEY_MIME_TYPE = "upload_mime_type"
        const val KEY_TRANSACTION_ID = "upload_transaction_id"
        const val KEY_RESULT_CODE = "upload_result_code"
        const val KEY_RESULT_SUCCESS = "upload_result_success"
        const val KEY_RESULT_MESSAGE = "upload_result_message"
        const val KEY_FIELD_PREFIX = "field_"
        const val KEY_HEADER_PREFIX = "header_"
        const val NOTIFICATION_CHANNEL_ID = "receipt_upload_channel"
        const val NOTIFICATION_ID = 9237
        const val TAG = "UploadWorker"
        const val ACTION_UPLOAD_RESULT = "com.expensify.reactnativebackgroundtask.UPLOAD_RESULT"

        fun buildInputData(
            url: String,
            filePath: String,
            fileName: String,
            mimeType: String,
            transactionId: String,
            fields: Map<String, String>,
            headers: Map<String, String>
        ): Data {
            val builder = Data.Builder()
                .putString(KEY_URL, url)
                .putString(KEY_FILE_PATH, filePath)
                .putString(KEY_FILE_NAME, fileName)
                .putString(KEY_MIME_TYPE, mimeType)
                .putString(KEY_TRANSACTION_ID, transactionId)
            fields.forEach { (key, value) -> builder.putString("$KEY_FIELD_PREFIX$key", value) }
            headers.forEach { (key, value) -> builder.putString("$KEY_HEADER_PREFIX$key", value) }
            return builder.build()
        }
    }

    private fun broadcastResult(success: Boolean, code: Int, transactionId: String, message: String? = null) {
        val intent = Intent(ACTION_UPLOAD_RESULT).apply {
            putExtra(KEY_TRANSACTION_ID, transactionId)
            putExtra(KEY_RESULT_SUCCESS, success)
            putExtra(KEY_RESULT_CODE, code)
            if (message != null) {
                putExtra(KEY_RESULT_MESSAGE, message)
            }
        }
        applicationContext.sendBroadcast(intent)
    }
}
