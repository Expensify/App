package com.expensify.chat.bootsplash;

import android.app.Activity;
import androidx.annotation.DrawableRes;
import androidx.annotation.NonNull;

public class BootSplash {

  public static void init(final @DrawableRes int drawableResId, @NonNull final Activity activity) {
    BootSplashModule.init(drawableResId, activity);
  }
}
