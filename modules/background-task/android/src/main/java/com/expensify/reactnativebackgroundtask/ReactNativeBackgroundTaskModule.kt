package com.expensify.reactnativebackgroundtask

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.Callback
import android.app.job.JobScheduler
import android.app.job.JobInfo
import android.content.ComponentName
import android.content.Context
import android.os.PersistableBundle

class ReactNativeBackgroundTaskModule internal constructor(context: ReactApplicationContext) :
  ReactNativeBackgroundTaskSpec(context) {

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
