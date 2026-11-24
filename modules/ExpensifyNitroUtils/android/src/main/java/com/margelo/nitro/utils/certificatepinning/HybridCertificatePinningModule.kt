package com.margelo.nitro.utils

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.Build
import com.margelo.nitro.NitroModules

/**
 * Receives the package-scoped broadcast that every Android pinning client (OkHttp, Cronet) sends when it
 * blocks a connection, and forwards it to JS. A broadcast keeps those clients free of any dependency on
 * this module, including the ones in Mobile-Expensify. The action and extras are documented in
 * config/certificatePinning/README.md and must match the senders.
 */
class HybridCertificatePinningModule : HybridCertificatePinningModuleSpec() {
    override val memorySize: Long = 16L

    private var receiver: BroadcastReceiver? = null

    override fun setConnectionBlockedListener(listener: (connection: BlockedConnection) -> Unit) {
        removeConnectionBlockedListener()
        val context = NitroModules.applicationContext ?: return

        val newReceiver = object : BroadcastReceiver() {
            override fun onReceive(receiverContext: Context, intent: Intent) {
                val host = intent.getStringExtra(EXTRA_HOST) ?: return
                listener(BlockedConnection(host, intent.getStringExtra(EXTRA_ROOT_CERTIFICATE_NAME)))
            }
        }
        val filter = IntentFilter(ACTION_CONNECTION_BLOCKED)
        // Not exported: only this app's own pinning clients may report a blocked connection. Before Android 13
        // a receiver of a custom action has no export flag, so the senders restrict the broadcast to this package.
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            context.registerReceiver(newReceiver, filter, Context.RECEIVER_NOT_EXPORTED)
        } else {
            context.registerReceiver(newReceiver, filter)
        }
        receiver = newReceiver
    }

    override fun removeConnectionBlockedListener() {
        val currentReceiver = receiver ?: return
        receiver = null
        NitroModules.applicationContext?.unregisterReceiver(currentReceiver)
    }

    companion object {
        const val ACTION_CONNECTION_BLOCKED = "com.expensify.CERTIFICATE_PINNING_CONNECTION_BLOCKED"
        const val EXTRA_HOST = "host"
        const val EXTRA_ROOT_CERTIFICATE_NAME = "rootCertificateName"
    }
}
