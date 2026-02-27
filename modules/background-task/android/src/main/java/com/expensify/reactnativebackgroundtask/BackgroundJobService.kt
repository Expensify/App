package com.expensify.reactnativebackgroundtask

import android.app.job.JobParameters
import android.app.job.JobService
import android.content.Intent
import android.util.Log
import com.facebook.react.ReactApplication

class BackgroundJobService : JobService() {
    override fun onStartJob(params: JobParameters?): Boolean {
        val taskName = params?.extras?.getString("taskName")
        val intent = Intent("com.expensify.reactnativebackgroundtask.TASK_ACTION").apply {
            putExtra("taskName", taskName)
        }
        sendBroadcast(intent)

        // Job is done, return false if no more work is needed
        return false
    }

    override fun onStopJob(params: JobParameters?): Boolean {
        // Return true to reschedule the job
        return true
    }
}
