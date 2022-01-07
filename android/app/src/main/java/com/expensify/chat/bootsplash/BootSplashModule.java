package com.expensify.chat.bootsplash;

import android.animation.Animator;
import android.animation.AnimatorListenerAdapter;
import android.app.Activity;
import android.view.View;
import android.view.ViewGroup;
import android.view.animation.AccelerateInterpolator;
import android.widget.LinearLayout;
import android.widget.LinearLayout.LayoutParams;

import androidx.annotation.DrawableRes;
import androidx.annotation.NonNull;

import com.expensify.chat.R;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.UiThreadUtil;
import com.facebook.react.module.annotations.ReactModule;

import java.util.Timer;
import java.util.TimerTask;

@ReactModule(name = BootSplashModule.MODULE_NAME)
public class BootSplashModule extends ReactContextBaseJavaModule {

  public static final String MODULE_NAME = "BootSplash";
  private static final int ANIMATION_DURATION = 220;

  private enum Status {
    VISIBLE,
    HIDDEN
  }

  private static int mDrawableResId = -1;
  private static Status mStatus = Status.HIDDEN;

  public BootSplashModule(ReactApplicationContext reactContext) {
    super(reactContext);
  }

  @Override
  public String getName() {
    return MODULE_NAME;
  }

  private static LinearLayout getLayout(@NonNull Activity activity, LayoutParams params) {
    LinearLayout layout = new LinearLayout(activity);
    View view = new View(activity);

    view.setBackgroundResource(mDrawableResId);
    layout.setId(R.id.bootsplash_layout_id);
    layout.setLayoutTransition(null);
    layout.setOrientation(LinearLayout.VERTICAL);
    layout.addView(view, params);

    return layout;
  }

  protected static void init(final @DrawableRes int drawableResId, final Activity activity) {
    UiThreadUtil.runOnUiThread(new Runnable() {
      @Override
      public void run() {
        if (activity == null
            || activity.isFinishing()
            || activity.findViewById(R.id.bootsplash_layout_id) != null) {
          return;
        }

        mDrawableResId = drawableResId;
        mStatus = Status.VISIBLE;

        LayoutParams params = new LayoutParams(
            LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT);
        activity.addContentView(getLayout(activity, params), params);
      }
    });
  }

  private void hideActivity() {
    if (mDrawableResId == -1)
      return;

    UiThreadUtil.runOnUiThread(new Runnable() {
      @Override
      public void run() {
        final Activity activity = getReactApplicationContext().getCurrentActivity();

        if (activity == null || activity.isFinishing()) {
          waitAndHideActivity();
          return;
        }

        final LinearLayout layout = activity.findViewById(R.id.bootsplash_layout_id);

        if (layout == null)
          return; // splash screen is already hidden

        final ViewGroup parent = (ViewGroup) layout.getParent();

        layout
            .animate()
            .setDuration(ANIMATION_DURATION)
            .alpha(0.0f)
            .setInterpolator(new AccelerateInterpolator())
            .setListener(new AnimatorListenerAdapter() {
              @Override
              public void onAnimationEnd(Animator animation) {
                super.onAnimationEnd(animation);

                if (parent != null)
                  parent.removeView(layout);

                mStatus = Status.HIDDEN;
              }
            }).start();
      }
    });
  }

  private void waitAndHideActivity() {
    final Timer timer = new Timer();

    timer.schedule(new TimerTask() {
      @Override
      public void run() {
        hideActivity();
        timer.cancel();
      }
    }, 250);
  }

  @ReactMethod
  public void hide() {
    hideActivity();
  }

  @ReactMethod
  public void getVisibilityStatus(final Promise promise) {
    switch (mStatus) {
      case VISIBLE:
        promise.resolve("visible");
        break;
      case HIDDEN:
        promise.resolve("hidden");
        break;
    }
  }
}