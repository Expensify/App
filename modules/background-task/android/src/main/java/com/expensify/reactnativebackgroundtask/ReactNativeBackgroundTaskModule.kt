package com.expensify.reactnativebackgroundtask

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.Callback
import com.facebook.react.bridge.ReadableMap
import android.app.job.JobScheduler
import android.app.job.JobInfo
import android.content.BroadcastReceiver
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.Build
import android.os.PersistableBundle
import android.util.Log
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.Arguments
import androidx.work.Data
import androidx.work.ExistingWorkPolicy
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.WorkManager

class ReactNativeBackgroundTaskModule internal constructor(context: ReactApplicationContext) :
  ReactNativeBackgroundTaskSpec(context) {

  private fun sendEvent(eventName: String, params: WritableMap?) {
    reactApplicationContext
      .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
      .emit(eventName, params)
  }

  private val taskReceiver = object : BroadcastReceiver() {
    override fun onReceive(context: Context?, intent: Intent?) {
      val taskName = intent?.getStringExtra("taskName")
      Log.d("ReactNativeBackgroundTaskModule", "Received task: $taskName")
      val params = Arguments.createMap()
      params.putString("taskName", taskName)
      sendEvent("onBackgroundTaskExecution", params)
    }
  }

  private val uploadResultReceiver = object : BroadcastReceiver() {
    override fun onReceive(context: Context?, intent: Intent?) {
      if (intent?.action != UploadWorker.ACTION_UPLOAD_RESULT) return
      val params = Arguments.createMap()
      params.putString("transactionID", intent.getStringExtra(UploadWorker.KEY_TRANSACTION_ID))
      params.putBoolean("success", intent.getBooleanExtra(UploadWorker.KEY_RESULT_SUCCESS, false))
      params.putInt("code", intent.getIntExtra(UploadWorker.KEY_RESULT_CODE, -1))
      val message = intent.getStringExtra(UploadWorker.KEY_RESULT_MESSAGE)
      if (message != null) {
        params.putString("message", message)
      }
      Log.d(NAME, "Upload result received ${params.toString()}")
      sendEvent("onReceiptUploadResult", params)
    }
  }

  init {
    val filter = IntentFilter("com.expensify.reactnativebackgroundtask.TASK_ACTION")
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        reactApplicationContext.registerReceiver(
          taskReceiver,
          filter,
          Context.RECEIVER_EXPORTED
        )
    } else {
      reactApplicationContext.registerReceiver(taskReceiver, filter)
    }

    val uploadFilter = IntentFilter(UploadWorker.ACTION_UPLOAD_RESULT)
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
      reactApplicationContext.registerReceiver(uploadResultReceiver, uploadFilter, Context.RECEIVER_NOT_EXPORTED)
    } else {
      reactApplicationContext.registerReceiver(uploadResultReceiver, uploadFilter)
    }
  }

  override fun getName(): String {
    return NAME
  }

  override fun invalidate() {
    super.invalidate()
    try {
          reactApplicationContext.unregisterReceiver(taskReceiver)
          Log.d("ReactNativeBackgroundTaskModule", "BroadcastReceiver unregistered")
      } catch (e: IllegalArgumentException) {
          Log.w("ReactNativeBackgroundTaskModule", "Receiver not registered or already unregistered")
      }
    try {
          reactApplicationContext.unregisterReceiver(uploadResultReceiver)
          Log.d("ReactNativeBackgroundTaskModule", "Upload result receiver unregistered")
      } catch (e: IllegalArgumentException) {
          Log.w("ReactNativeBackgroundTaskModule", "Upload result receiver not registered or already unregistered")
      }
  }

  @ReactMethod
  override fun defineTask(taskName: String, taskExecutor: Callback, promise: Promise) {
    try {
      val jobScheduler = reactApplicationContext.getSystemService(Context.JOB_SCHEDULER_SERVICE) as JobScheduler
      val componentName = ComponentName(reactApplicationContext, BackgroundJobService::class.java)

      val extras = PersistableBundle().apply {
        putString("taskName", taskName)
      }

      val jobInfo = JobInfo.Builder(taskName.hashCode() and 0xFFFFFF, componentName)
        .setPeriodic(15 * 60 * 1000L) // 15 minutes in milliseconds
        .setPersisted(true) // Job persists after reboot
        .setRequiredNetworkType(JobInfo.NETWORK_TYPE_ANY)
        .setExtras(extras)
        .build()

      val resultCode = jobScheduler.schedule(jobInfo)
      if (resultCode == JobScheduler.RESULT_SUCCESS) {
        Log.d(NAME, "Scheduled background task: $taskName")

        promise.resolve(null);
      } else {
        promise.reject("ERROR", "Failed to schedule job")
      }
    } catch (e: Exception) {
      promise.reject("ERROR", e.message)
    }
  }

  override fun addListener(eventType: String?) {
    // no-op
  }

  override fun removeListeners(count: Double) {
    // no-op
  }

  @ReactMethod
  override fun startReceiptUpload(options: ReadableMap, promise: Promise) {
    try {
      val url = options.getString("url") ?: run {
        promise.reject("INVALID_ARGS", "Missing url")
        return
      }
      val filePath = options.getString("filePath") ?: run {
        promise.reject("INVALID_ARGS", "Missing filePath")
        return
      }
      val fileName = options.getString("fileName") ?: ""
      val mimeType = options.getString("mimeType") ?: "application/octet-stream"
      val transactionId = options.getString("transactionID") ?: ""
      val fields = options.getMap("fields")?.toHashMap()?.mapValues { it.value.toString() } ?: emptyMap()
      val headers = options.getMap("headers")?.toHashMap()?.mapValues { it.value.toString() } ?: emptyMap()

      Log.d(NAME, "Enqueue receipt upload tx=$transactionId file=$filePath url=$url")

      val inputData: Data = UploadWorker.buildInputData(
        url = url,
        filePath = filePath,
        fileName = fileName,
        mimeType = mimeType,
        transactionId = transactionId,
        fields = fields,
        headers = headers
      )

      val request = OneTimeWorkRequestBuilder<UploadWorker>()
        .setInputData(inputData)
        .addTag("receipt_upload")
        .addTag(transactionId.ifEmpty { "receipt_upload_generic" })
        .build()

      WorkManager.getInstance(reactApplicationContext)
        .enqueueUniqueWork(
          "receipt_upload_$transactionId",
          ExistingWorkPolicy.REPLACE,
          request
        )

      promise.resolve(null)
    } catch (e: Exception) {
      Log.e(NAME, "Failed to enqueue receipt upload", e)
      promise.reject("UPLOAD_ENQUEUE_FAILED", e)
    }
  }

  companion object {
    const val NAME = "ReactNativeBackgroundTask"
  }
}
