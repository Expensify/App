package com.expensify.chat.bootsplash;

import android.app.Activity;
import android.app.ActivityManager;
import android.os.Build;
import android.view.Window;
import android.view.WindowManager;
import com.expensify.chat.R;

// Covers the UI with the boot splash while the app is leaving the foreground
public final class PrivacyCover {

  // Only MainActivity shows the cover
  private static BootSplashDialog cover;

  private PrivacyCover() {}

  // setRecentsScreenshotEnabled() requires API 33, so the cover alone wouldn't suppress the snapshot
  public static boolean isSupported() {
    return Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU;
  }

  public static void show(Activity activity) {
    if (!isSupported() || activity.isFinishing() || activity.isDestroyed()
        || activity.isInMultiWindowMode() || cover != null) {
      return;
    }
    BootSplashDialog dialog = new BootSplashDialog(activity, R.style.BootTheme);
    Window window = dialog.getWindow();
    if (window != null) {
      // Leave the focus with the activity underneath so it returns exactly as the user left it
      window.setFlags(
          WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
          WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE);
      // The default dialog fade-in would let the snapshot see the content underneath
      window.setWindowAnimations(0);
    }
    dialog.show();
    cover = dialog;
  }

  public static void hide() {
    if (cover != null) {
      cover.dismiss();
      cover = null;
    }
  }

  // Recents shows this card instead of a snapshot, since snapshots are disabled for privacy.
  public static void applyTaskDescription(Activity activity) {
    if (!isSupported()) {
      return;
    }
    activity.setTaskDescription(new ActivityManager.TaskDescription.Builder()
        .setBackgroundColor(activity.getColor(R.color.bootsplash_background))
        .setStatusBarColor(activity.getColor(R.color.bootsplash_background))
        .build());
  }
}
