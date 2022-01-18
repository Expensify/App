package com.expensify.chat.bootsplash;

import android.content.Intent;
import android.os.Bundle;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import com.expensify.chat.MainActivity;

public class BootSplashActivity extends AppCompatActivity {

  @Override
  protected void onCreate(@Nullable Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    forwardIntentToMainActivity(getIntent());
  }

  @Override
  protected void onNewIntent(Intent intent) {
    super.onNewIntent(intent);
    forwardIntentToMainActivity(intent);
  }

  protected void forwardIntentToMainActivity(Intent intent) {
    Intent intentCopy = (Intent) intent.clone();
    intentCopy.setClass(this, MainActivity.class);

    startActivity(intentCopy);
    finish();
  }
}
