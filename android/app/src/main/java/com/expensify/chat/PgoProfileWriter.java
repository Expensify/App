package com.expensify.chat;

import android.content.Context;

/** Development-only bridge for persisting LLVM PGO counters before Android kills the process. */
public final class PgoProfileWriter {
    private PgoProfileWriter() {}

    private static native int writeProfiles(String directory);

    public static int writeProfiles(Context context) {
        if (!BuildConfig.PGO_PROFILE_GENERATION) {
            return 0;
        }

        System.loadLibrary("ExpensifyNitroUtils");
        return writeProfiles(context.getCacheDir().getAbsolutePath());
    }
}
