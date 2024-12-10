package com.expensify.reactnativebackgroundtask

import android.app.job.JobParameters
import android.app.job.JobService
import android.util.Log
import com.facebook.react.ReactApplication

class BackgroundJobService : JobService() {
    override fun onStartJob(params: JobParameters?): Boolean {
        // Get the stored taskName
        val extras = params?.extras
        val taskName = extras?.getString("taskName")

        taskName?.let {
            val reactApplication = application as ReactApplication
            val reactNativeHost = reactApplication.reactNativeHost
            val reactContext = reactNativeHost.reactInstanceManager.currentReactContext

            reactContext?.getNativeModule(ReactNativeBackgroundTaskModule::class.java)
                ?.emitOnBackgroundTaskExecution(it)
        }
        return false
    }

    override fun onStopJob(params: JobParameters?): Boolean {
        // Return true to reschedule the job
        return true
    }
}
