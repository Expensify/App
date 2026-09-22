package com.expensify.chat;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

/**
 * Receives an explicit adb broadcast at the end of a local PGO collection run.
 *
 * The receiver is inert in ordinary builds. It deliberately lives outside the JS surface so a
 * manual profiling journey can finish before its native counters are persisted.
 */
public final class PgoProfileReceiver extends BroadcastReceiver {
    private static final String TAG = "PgoProfileReceiver";

    @Override
    public void onReceive(Context context, Intent intent) {
        if (!BuildConfig.PGO_PROFILE_GENERATION) {
            Log.w(TAG, "Ignoring PGO profile request in a non-instrumented build.");
            return;
        }

        final int writtenProfiles = PgoProfileWriter.writeProfiles(context);
        Log.i(TAG, "Wrote " + writtenProfiles + " LLVM PGO profile(s).");
    }
}
