package com.expensify.chat;

import android.os.Bundle;
import android.content.pm.ActivityInfo;
import android.view.KeyEvent;
import com.expensify.chat.bootsplash.BootSplash;
import com.expensify.reactnativekeycommand.KeyCommandModule;
import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint;
import com.facebook.react.defaults.DefaultReactActivityDelegate;

public class MainActivity extends ReactActivity {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "NewExpensify";
  }

  /**
   * Returns the instance of the {@link ReactActivityDelegate}. Here we use a util class {@link
   * DefaultReactActivityDelegate} which allows you to easily enable Fabric and Concurrent React
   * (aka React 18) with two boolean flags.
   */
  @Override
  protected ReactActivityDelegate createReactActivityDelegate() {
    return new DefaultReactActivityDelegate(
        this,
        getMainComponentName(),
        // If you opted-in for the New Architecture, we enable the Fabric Renderer.
        DefaultNewArchitectureEntryPoint.getFabricEnabled(), // fabricEnabled
        // If you opted-in for the New Architecture, we enable Concurrent React (i.e. React 18).
        DefaultNewArchitectureEntryPoint.getConcurrentReactEnabled() // concurrentRootEnabled
        );
  }

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    BootSplash.init(this);
    super.onCreate(null);
    if (getResources().getBoolean(R.bool.portrait_only)) {
      setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_PORTRAIT);
    }
  }

  /**
   * This method is called when a key down event has occurred.
   * Forwards the event to the KeyCommandModule
   */
  @Override
  public boolean onKeyDown(int keyCode, KeyEvent event) {
    // Disabling hardware ESCAPE support which is handled by Android
    if (event.getKeyCode() == KeyEvent.KEYCODE_ESCAPE) { 
        return false; 
    }
    KeyCommandModule.getInstance().onKeyDownEvent(keyCode, event);
    return super.onKeyDown(keyCode, event);
  }

  @Override
  public boolean onKeyLongPress(int keyCode, KeyEvent event) {    
    // Disabling hardware ESCAPE support which is handled by Android
    if (event.getKeyCode() == KeyEvent.KEYCODE_ESCAPE) { return false; }
    KeyCommandModule.getInstance().onKeyDownEvent(keyCode, event);
    return super.onKeyLongPress(keyCode, event);
  }

  @Override
  public boolean onKeyUp(int keyCode, KeyEvent event) {    
    // Disabling hardware ESCAPE support which is handled by Android
    if (event.getKeyCode() == KeyEvent.KEYCODE_ESCAPE) { return false; }
    KeyCommandModule.getInstance().onKeyDownEvent(keyCode, event);
    return super.onKeyUp(keyCode, event);
  }
}