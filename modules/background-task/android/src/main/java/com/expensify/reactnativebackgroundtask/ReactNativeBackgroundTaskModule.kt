package com.expensify.reactnativebackgroundtask

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.Callback
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

class ReactNativeBackgroundTaskModule internal constructor(context: ReactApplicationContext) :
  ReactNativeBackgroundTaskSpec(context) {

  private val taskReceiver = object : BroadcastReceiver() {
    override fun onReceive(context: Context?, intent: Intent?) {
      val taskName = intent?.getStringExtra("taskName")
      Log.d("ReactNativeBackgroundTaskModule", "Received task: $taskName")
      emitOnBackgroundTaskExecution(taskName)
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
    }
  }

  override fun getName(): String {
    return NAME
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

        promise.resolve(null);
      } else {
        promise.reject("ERROR", "Failed to schedule job")
      }
    } catch (e: Exception) {
      promise.reject("ERROR", e.message)
    }
  }

  companion object {
    const val NAME = "ReactNativeBackgroundTask"
  }
}
