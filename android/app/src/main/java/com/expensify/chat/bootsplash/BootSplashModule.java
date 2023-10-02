package com.expensify.chat.bootsplash;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Context;
import android.content.DialogInterface;
import android.content.res.Resources;
import android.os.Build;
import android.view.View;
import android.view.ViewConfiguration;
import android.view.ViewTreeObserver;
import android.window.SplashScreen;
import android.window.SplashScreenView;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import com.expensify.chat.R;
import com.facebook.common.logging.FLog;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.UiThreadUtil;
import com.facebook.react.common.ReactConstants;
import com.facebook.react.module.annotations.ReactModule;
import com.facebook.react.uimanager.PixelUtil;
import java.lang.reflect.Field;
import java.util.HashMap;
import java.util.Map;
import java.util.Timer;
import java.util.TimerTask;

@ReactModule(name = BootSplashModule.NAME)
public class BootSplashModule extends ReactContextBaseJavaModule {

  public static final String NAME = "BootSplash";
  private static final BootSplashQueue<Promise> mPromiseQueue = new BootSplashQueue<>();
  private static boolean mShouldKeepOnScreen = true;

  @Nullable
  private static BootSplashDialog mDialog = null;

  public BootSplashModule(ReactApplicationContext reactContext) {
    super(reactContext);
  }

  @Override
  public String getName() {
    return NAME;
  }

  // From https://stackoverflow.com/a/61062773
  public static boolean isSamsungOneUI4() {
    String name = "SEM_PLATFORM_INT";

    try {
      Field field = Build.VERSION.class.getDeclaredField(name);
      int version = (field.getInt(null) - 90000) / 10000;
      return version == 4;
    } catch (Exception ignored) {
      return false;
    }
  }

  @Override
  public Map<String, Object> getConstants() {
    final HashMap<String, Object> constants = new HashMap<>();
    final Context context = getReactApplicationContext();
    final Resources resources = context.getResources();

    @SuppressLint({"DiscouragedApi", "InternalInsetResource"}) final int heightResId =
        resources.getIdentifier("navigation_bar_height", "dimen", "android");

    final float height =
        heightResId > 0 && !ViewConfiguration.get(context).hasPermanentMenuKey()
            ? Math.round(PixelUtil.toDIPFromPixel(resources.getDimensionPixelSize(heightResId)))
            : 0;

    constants.put("logoSizeRatio", isSamsungOneUI4() ? 0.5 : 1);
    constants.put("navigationBarHeight", height);
    return constants;
  }

  protected static void init(@Nullable final Activity activity) {
    if (activity == null) {
      FLog.w(ReactConstants.TAG, NAME + ": Ignored initialization, current activity is null.");
      return;
    }

    activity.setTheme(R.style.AppTheme);

    // Keep the splash screen on-screen until Dialog is shown
    final View contentView = activity.findViewById(android.R.id.content);

    contentView
      .getViewTreeObserver()
      .addOnPreDrawListener(new ViewTreeObserver.OnPreDrawListener() {
      @Override
      public boolean onPreDraw() {
        if (mShouldKeepOnScreen) {
          return false;
        }

        contentView
          .getViewTreeObserver()
          .removeOnPreDrawListener(this);

        return true;
      }
    });

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
      // This is not called on Android 12 when activity is started using intent
      // (Android studio / CLI / notification / widget…)
      activity
        .getSplashScreen()
        .setOnExitAnimationListener(new SplashScreen.OnExitAnimationListener() {
          @Override
          public void onSplashScreenExit(@NonNull SplashScreenView view) {
            view.remove(); // Remove it immediately, without animation
          }
        });
    }

    mDialog = new BootSplashDialog(activity, R.style.BootTheme);

    mDialog.setOnShowListener(new DialogInterface.OnShowListener() {
      @Override
      public void onShow(DialogInterface dialog) {
        mShouldKeepOnScreen = false;
      }
    });

    UiThreadUtil.runOnUiThread(new Runnable() {
      @Override
      public void run() {
        mDialog.show();
      }
    });
  }

  private void clearPromiseQueue() {
    while (!mPromiseQueue.isEmpty()) {
      Promise promise = mPromiseQueue.shift();

      if (promise != null)
        promise.resolve(true);
    }
  }

  private void hideAndClearPromiseQueue() {
    UiThreadUtil.runOnUiThread(new Runnable() {
      @Override
      public void run() {
        final Activity activity = getReactApplicationContext().getCurrentActivity();

        if (mShouldKeepOnScreen ||  activity == null || activity.isFinishing()) {
          final Timer timer = new Timer();

          timer.schedule(new TimerTask() {
            @Override
            public void run() {
              timer.cancel();
              hideAndClearPromiseQueue();
            }
          }, 100);
        } else if (mDialog == null) {
          clearPromiseQueue();
        } else {
          mDialog.setOnDismissListener(new DialogInterface.OnDismissListener() {
            @Override
            public void onDismiss(DialogInterface dialog) {
              mDialog = null;
              clearPromiseQueue();
            }
          });

          mDialog.dismiss();
        }
      }
    });
  }

  @ReactMethod
  public void hide(final Promise promise) {
    mPromiseQueue.push(promise);
    hideAndClearPromiseQueue();
  }

  @ReactMethod
  public void getVisibilityStatus(final Promise promise) {
    promise.resolve(mShouldKeepOnScreen || mDialog != null ? "visible" : "hidden");
  }
}
