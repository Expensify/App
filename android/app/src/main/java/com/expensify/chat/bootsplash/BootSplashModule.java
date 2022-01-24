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
  private static int mDrawableResId = -1;
  private static boolean mSplashVisible = false;

  public BootSplashModule(ReactApplicationContext reactContext) {
    super(reactContext);
  }

  @Override
  public String getName() {
    return MODULE_NAME;
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
        mSplashVisible = true;

        LinearLayout layout = new LinearLayout(activity);
        layout.setId(R.id.bootsplash_layout_id);
        layout.setLayoutTransition(null);
        layout.setOrientation(LinearLayout.VERTICAL);

        View view = new View(activity);
        view.setBackgroundResource(mDrawableResId);

        LayoutParams params = new LayoutParams(
            LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT);

        layout.addView(view, params);
        activity.addContentView(layout, params);
      }
    });
  }

  private void waitAndHide() {
    final Timer timer = new Timer();

    timer.schedule(new TimerTask() {
      @Override
      public void run() {
        hide();
        timer.cancel();
      }
    }, 250);
  }

  @ReactMethod
  public void hide() {
    if (mDrawableResId == -1)
      return;

    UiThreadUtil.runOnUiThread(new Runnable() {
      @Override
      public void run() {
        final Activity activity = getReactApplicationContext().getCurrentActivity();

        if (activity == null || activity.isFinishing()) {
          waitAndHide();
          return;
        }

        final LinearLayout layout = activity.findViewById(R.id.bootsplash_layout_id);

        // check if splash screen is already hidden
        if (layout == null)
          return;

        final ViewGroup parent = (ViewGroup) layout.getParent();

        layout
            .animate()
            .setDuration(250)
            .alpha(0.0f)
            .setInterpolator(new AccelerateInterpolator())
            .setListener(new AnimatorListenerAdapter() {
              @Override
              public void onAnimationEnd(Animator animation) {
                super.onAnimationEnd(animation);

                if (parent != null)
                  parent.removeView(layout);

                mDrawableResId = -1;
                mSplashVisible = false;
              }
            }).start();
      }
    });
  }

  @ReactMethod
  public void getVisibilityStatus(final Promise promise) {
    promise.resolve(mSplashVisible ? "visible" : "hidden");
  }
}
