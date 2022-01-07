package com.expensify.chat.bootsplash;

import android.content.Intent;
import android.os.Bundle;

import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;

import com.expensify.chat.MainActivity;

public class BootSplashActivity extends AppCompatActivity {

  protected void forwardIntentToMainActivity(Intent intent) {
    Intent intentCopy = new Intent(intent);

    intentCopy.setClass(this, MainActivity.class);
    intentCopy.putExtras(intent);
    intentCopy.setData(intent.getData());
    intentCopy.setAction(intent.getAction());

    String type = intent.getType();

    if (type != null) {
      intentCopy.setType(type);
    }

    startActivity(intentCopy);
    finish();
  }

  @Override
  protected void onNewIntent(Intent intent) {
    super.onNewIntent(intent);
    forwardIntentToMainActivity(intent);
  }

  @Override
  protected void onCreate(@Nullable Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    forwardIntentToMainActivity(getIntent());
  }
}
