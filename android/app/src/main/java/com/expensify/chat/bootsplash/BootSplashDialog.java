package com.expensify.chat.bootsplash;

import android.app.Dialog;
import android.content.Context;
import android.os.Bundle;
import android.view.Window;
import android.view.WindowManager.LayoutParams;
import androidx.annotation.NonNull;
import com.expensify.chat.R;

public class BootSplashDialog extends Dialog {

  public BootSplashDialog(@NonNull Context context, int themeResId) {
    super(context, themeResId);
    setCancelable(false);
    setCanceledOnTouchOutside(false);
  }

  @Override
  public void onBackPressed() {
    // Prevent default behavior
  }

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    final Window window = this.getWindow();

    if (window != null) {
      window.setLayout(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT);

      if (BootSplashModule.isSamsungOneUI4()) {
        window.setBackgroundDrawableResource(R.drawable.bootsplash_samsung_oneui_4);
      }
    }

    super.onCreate(savedInstanceState);
  }
}
