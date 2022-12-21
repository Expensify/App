package com.expensify.chat;

import android.content.Context;
import android.database.CursorWindow;

import androidx.multidex.MultiDexApplication;

import com.expensify.chat.bootsplash.BootSplashPackage;
import com.facebook.react.PackageList;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.views.text.ReactFontManager;
import com.facebook.react.config.ReactFeatureFlags;
import com.facebook.react.modules.i18nmanager.I18nUtil;
import com.facebook.soloader.SoLoader;
import com.google.firebase.crashlytics.FirebaseCrashlytics;

import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.util.List;

public class MainApplication extends MultiDexApplication implements ReactApplication {

  private final ReactNativeHost mReactNativeHost =
      new ReactNativeHost(this) {
        @Override
        public boolean getUseDeveloperSupport() {
          return BuildConfig.DEBUG;
        }

        @Override
        protected List<ReactPackage> getPackages() {
          @SuppressWarnings("UnnecessaryLocalVariable")
          List<ReactPackage> packages = new PackageList(this).getPackages();
          // Packages that cannot be autolinked yet can be added manually here, for example:
          // packages.add(new MyReactNativePackage());
          packages.add(new BootSplashPackage());
          packages.add(new ExpensifyAppPackage());

          return packages;
        }

        @Override
        protected String getJSMainModuleName() {
          return "index";
        }
      };

  // TODO: Use this to enable new architecture.
  // private final ReactNativeHost mNewArchitectureNativeHost =
  //       new MainApplicationReactNativeHost(this);
  private final ReactNativeHost mNewArchitectureNativeHost = null;

  @Override
  public ReactNativeHost getReactNativeHost() {
    if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
      return mNewArchitectureNativeHost;
    } else {
      return mReactNativeHost;
    }
  }

  @Override
  public void onCreate() {
      super.onCreate();
      // If you opted-in for the New Architecture, we enable the TurboModule system
      ReactFeatureFlags.useTurboModules = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED;
      ReactFontManager.getInstance().addCustomFont(this, "Expensify New Kansas", R.font.expensifynewkansas);
      SoLoader.init(this, /* native exopackage */ false);
      initializeFlipper(this, getReactNativeHost().getReactInstanceManager());
      if (BuildConfig.DEBUG) {
          FirebaseCrashlytics.getInstance().setCrashlyticsCollectionEnabled(false);
      }

      // Force the app to LTR mode.
      I18nUtil sharedI18nUtilInstance = I18nUtil.getInstance();
      sharedI18nUtilInstance.allowRTL(getApplicationContext(), false);

      // Start the "js_load" custom performance tracing metric. This timer is stopped by a native
      // module in the JS so we can measure total time starting in the native layer and ending in
      // the JS layer.
      StartupTimer.start();

      // Increase SQLite DB write size
      try {
        Field field = CursorWindow.class.getDeclaredField("sCursorWindowSize");
        field.setAccessible(true);
        field.set(null, 100 * 1024 * 1024); //the 100MB is the new size
      } catch (Exception e) {
        e.printStackTrace();
      }
  }

  /**
   * Loads Flipper in React Native templates. Call this in the onCreate method with something like
   * initializeFlipper(this, getReactNativeHost().getReactInstanceManager());
   *
   * @param context
   * @param reactInstanceManager
   */
  private static void initializeFlipper(
      Context context, ReactInstanceManager reactInstanceManager) {
    if (BuildConfig.DEBUG) {
      try {
        /*
         We use reflection here to pick up the class that initializes Flipper,
        since Flipper library is not available in release mode
        */
        Class<?> aClass = Class.forName("com.reactnativechat.ReactNativeFlipper");
        aClass
            .getMethod("initializeFlipper", Context.class, ReactInstanceManager.class)
            .invoke(null, context, reactInstanceManager);
      } catch (Exception e) {
        e.printStackTrace();
      }
    }
  }
}
