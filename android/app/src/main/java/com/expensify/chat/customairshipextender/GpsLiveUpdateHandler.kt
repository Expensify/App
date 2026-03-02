package com.expensify.chat.customairshipextender

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import androidx.core.app.NotificationCompat
import com.expensify.chat.R
import com.urbanairship.liveupdate.LiveUpdate
import com.urbanairship.liveupdate.LiveUpdateEvent
import com.urbanairship.liveupdate.LiveUpdateResult
import com.urbanairship.liveupdate.SuspendLiveUpdateNotificationHandler

class GpsLiveUpdateHandler : SuspendLiveUpdateNotificationHandler() {

    override suspend fun onUpdate(
        context: Context,
        event: LiveUpdateEvent,
        update: LiveUpdate
    ): LiveUpdateResult<NotificationCompat.Builder> {
        if (event == LiveUpdateEvent.END) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.stopService(Intent(context, GpsTripService::class.java))
            }
            return LiveUpdateResult.cancel()
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            context.startService(Intent(context, GpsTripService::class.java))
        }
        ensureNotificationChannel(context)

        val title = update.content.opt("title").optString() ?: "GPS tracking in progress"
        val body = update.content.opt("body").optString() ?: "Go to the app to finish"

        val builder = NotificationCompat.Builder(context, NOTIFICATION_CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_notification)
            .setContentTitle(title)
            .setContentText(body)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_EVENT)
            .setAutoCancel(false)

        val deepLink = update.content.opt("deepLink").optString()
        if (!deepLink.isNullOrEmpty()) {
            val intent = Intent(Intent.ACTION_VIEW, Uri.parse("new-expensify://$deepLink")).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP
            }
            val pendingIntent = PendingIntent.getActivity(
                context, 0, intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            builder.setContentIntent(pendingIntent)
        }

        return LiveUpdateResult.ok(builder)
    }

    private fun ensureNotificationChannel(context: Context) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return

        val manager = context.getSystemService(NotificationManager::class.java)
        if (manager.getNotificationChannel(NOTIFICATION_CHANNEL_ID) != null) return

        val channel = NotificationChannel(
            NOTIFICATION_CHANNEL_ID,
            NOTIFICATION_CHANNEL_NAME,
            NotificationManager.IMPORTANCE_HIGH
        ).apply {
            description = NOTIFICATION_CHANNEL_DESCRIPTION
        }
        manager.createNotificationChannel(channel)
    }

    companion object {
        const val NOTIFICATION_CHANNEL_ID = "gps_trip_notification_channel_id"
        const val NOTIFICATION_CHANNEL_NAME = "GPS Trip Tracking"
        const val NOTIFICATION_CHANNEL_DESCRIPTION = "Shows when a GPS distance trip is being tracked"
        const val TYPE = "gps_trip_notification"
    }
}
