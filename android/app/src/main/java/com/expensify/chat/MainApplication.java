package com.expensify.chat;

import android.content.Context;
import android.database.CursorWindow;

import androidx.appcompat.app.AppCompatDelegate;
import androidx.multidex.MultiDexApplication;

import com.expensify.chat.bootsplash.BootSplashPackage;
import com.facebook.react.PackageList;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint;
import com.facebook.react.defaults.DefaultReactNativeHost;
import com.facebook.react.modules.i18nmanager.I18nUtil;
import com.facebook.soloader.SoLoader;
import com.google.firebase.crashlytics.FirebaseCrashlytics;

import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.util.List;

public class MainApplication extends MultiDexApplication implements ReactApplication {
  private final ReactNativeHost mReactNativeHost =
      new DefaultReactNativeHost(this) {
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

        @Override
        protected boolean isNewArchEnabled() {
          return BuildConfig.IS_NEW_ARCHITECTURE_ENABLED;
        }

        @Override
        protected Boolean isHermesEnabled() {
          return BuildConfig.IS_HERMES_ENABLED;
        }
      };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
      super.onCreate();

      // Use night (dark) mode so native UI defaults to dark theme.
      AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_YES);

      SoLoader.init(this, /* native exopackage */ false);
      if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
        // If you opted-in for the New Architecture, we load the native entry point for this app.
        DefaultNewArchitectureEntryPoint.load();
      }
      ReactNativeFlipper.initializeFlipper(this, getReactNativeHost().getReactInstanceManager());

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
}