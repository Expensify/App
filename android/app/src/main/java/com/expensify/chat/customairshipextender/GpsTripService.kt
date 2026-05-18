package com.expensify.chat.customairshipextender

import android.app.NotificationManager
import android.app.Service
import android.content.Intent
import android.os.IBinder

/**
 * Lightweight service that runs alongside the Airship LiveUpdate GPS notification.
 * Its sole purpose is to cancel the notification when the app is killed,
 * since Airship LiveUpdate notifications persist beyond the app process lifecycle.
 */
class GpsTripService : Service() {

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onTaskRemoved(rootIntent: Intent?) {
        cancelGpsNotifications()
        stopSelf()
        super.onTaskRemoved(rootIntent)
    }

    private fun cancelGpsNotifications() {
        val notificationManager = getSystemService(NotificationManager::class.java) ?: return
        notificationManager.activeNotifications
            .filter { it.notification.channelId == GpsLiveUpdateHandler.NOTIFICATION_CHANNEL_ID }
            .forEach { notificationManager.cancel(it.tag, it.id) }
    }
}
