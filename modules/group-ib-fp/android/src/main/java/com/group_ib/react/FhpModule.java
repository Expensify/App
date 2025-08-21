package com.group_ib.react;

import android.app.Activity;
import android.os.Handler;
import android.util.Log;
import android.webkit.WebView;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.module.annotations.ReactModule;
import com.facebook.react.bridge.ReadableArray;
import com.group_ib.sdk.MobileSdk;
import com.group_ib.sdk.PackageCollectionModule;
import java.util.HashSet;
import java.util.Map;


@ReactModule(name = FhpModule.NAME)
public class FhpModule extends ReactContextBaseJavaModule {
  public static final String NAME = "ModuleFhpIos";
  private static final String HEADER_USER_AGENT = "User-Agent";
  private static MobileSdk sdk = null;
  private static WebView webView = null;
  private Handler mMainHandler = null;

  enum Capabilities {
    CELLS_COLLECTION_CAPABILITY(MobileSdk.Capability.CellsCollectionCapability),
    ACCESS_POINTS_COLLECTION_CAPABILITY(MobileSdk.Capability.AccessPointsCollectionCapability),
    LOCATION_CAPABILITY(MobileSdk.Capability.LocationCapability),
    GLOBAL_IDENTIFICATION_CAPABILITY(MobileSdk.Capability.GlobalIdentificationCapability),
    CLOUD_IDENTIFICATION_CAPABILITY(MobileSdk.Capability.CloudIdentificationCapability),
    CALL_IDENTIFICATION_CAPABILITY(MobileSdk.Capability.CallIdentificationCapability),
    ACTIVITY_COLLECTION_CAPABILITY(MobileSdk.Capability.ActivityCollectionCapability),
    MOTION_COLLECTION_CAPABILITY(MobileSdk.Capability.MotionCollectionCapability),
    PACKAGE_COLLECTION_CAPABILITY(MobileSdk.Capability.PackageCollectionCapability);
    final MobileSdk.Capability value;
    Capabilities(MobileSdk.Capability val) {
      this.value = val;
    }
  }

  public static synchronized void initAppWebView(WebView wv) {
    if (sdk != null) {
      sdk.initAppWebView(wv);
      webView = null;
    } else {
      webView = wv;
    }
  }

  public FhpModule(ReactApplicationContext reactContext) {
    super(reactContext);
  }

  @Override
  public void initialize() {
    super.initialize();
    mMainHandler = new Handler(getReactApplicationContext().getMainLooper());
    try {
      MobileSdk.enableDebugLogs();
      PackageCollectionModule.init();
      Activity activity = getCurrentActivity();
      sdk = MobileSdk.init(activity != null ? activity : getReactApplicationContext());
      if (webView != null) initAppWebView(webView);
    } catch (Exception e) {
      Log.e("GIBSDK", "failed to initialize SDK", e);
    }
  }

  @Override
  @NonNull
  public String getName() {
    return NAME;
  }

  @ReactMethod
  public void setCustomerId(String customerId, Callback errorCallback) {
    try {
      sdk.setCustomerId(customerId);
    } catch (Exception e) {
      errorCallback.invoke(e.getMessage());
    }
  }

  @ReactMethod
  public void setTargetURL(String targetUrl, Callback errorCallback) {
    try {
      sdk.setTargetURL(targetUrl);
    } catch (Exception e) {
      errorCallback.invoke(e.getMessage());
    }
  }

  @ReactMethod
  public void setPublicKeyForPinning(String pubKey, Callback errorCallback) {
    try {
      if (pubKey != null) {
        HashSet<String> keySet = new HashSet<>();
        keySet.add(pubKey);
        sdk.setPublicKeyForPinning(keySet);
      }
    } catch (Exception e) {
      errorCallback.invoke(e.getMessage());
    }
  }

  @ReactMethod
  public void setPublicKeysForPinning(ReadableArray pubKeys, Callback errorCallback) {
    try {
      if (pubKeys != null) {
        HashSet<String> keySet = new HashSet<>();
        for (int i = 0; i < pubKeys.size(); i++) {
          keySet.add(pubKeys.getString(i));
        }
        sdk.setPublicKeyForPinning(keySet);
      }
    } catch (Exception e) {
      errorCallback.invoke(e.getMessage());
    }
  }

  @ReactMethod
  public void setLogin(String login, Callback errorCallback) {
    try {
      sdk.setLogin(login);
    } catch (Exception e) {
      errorCallback.invoke(e.getMessage());
    }
  }

  @ReactMethod
  public void setSessionId(String sessionId, Callback errorCallback) {
    try {
      sdk.setSessionId(sessionId);
    } catch (Exception e) {
      errorCallback.invoke(e.getMessage());
    }
  }

  @ReactMethod
  public void setFormat(String param, int format, Callback errorCallback) {
    try {
      sdk.setFormat(param, format);
    } catch (Exception e) {
      errorCallback.invoke(e.getMessage());
    }
  }

  @ReactMethod
  public void setPubKey(String pubKey, Callback errorCallback) {
    try {
      sdk.setPubKey(pubKey);
    } catch (Exception e) {
      errorCallback.invoke(e.getMessage());
    }
  }

  @ReactMethod
  public void setCustomEvent(String customEvent, Callback errorCallback) {
    try {
      sdk.setCustomEvent(customEvent);
    } catch (Exception e) {
      errorCallback.invoke(e.getMessage());
    }
  }

  @ReactMethod
  public void setAttributeTitle(String title, String value, int format, Callback errorCallback) {
    try {
      sdk.setAttribute(title, value, format);
    } catch (Exception e) {
      errorCallback.invoke(e.getMessage());
    }
  }

  @ReactMethod
  public void setLogURL(String url, Callback errorCallback) {
    try {
      sdk.setLogURL(url);
    } catch (Exception e) {
      errorCallback.invoke(e.getMessage());
    }
  }

  @ReactMethod
  public void setHeaderValue(String value, String name, Callback errorCallback) {
    try {
      sdk.setHeader(name, value);
    } catch (Exception e) {
      errorCallback.invoke(e.getMessage());
    }
  }

  @ReactMethod
  public void setUserAgent(String value, Callback errorCallback) {
    try {
      sdk.setHeader(HEADER_USER_AGENT, value);
    } catch (Exception e) {
      errorCallback.invoke(e.getMessage());
    }
  }

  @ReactMethod
  public void setKeepAliveTimeout(int timeout, Callback errorCallback) {
    try {
      sdk.setKeepAliveTimeout(timeout);
    } catch (Exception e) {
      errorCallback.invoke(e.getMessage());
    }
  }

  @ReactMethod
  public void setGlobalIdURL(String globalIdURL, Callback errorCallback) {
    try {
      sdk.setGlobalIdURL(globalIdURL);
    } catch (Exception e) {
      errorCallback.invoke(e.getMessage());
    }
  }

  @ReactMethod
  public void enableAndroidCapability(int capability, Callback callback) {
    MobileSdk.Capability sdkCapability = Capabilities.values()[capability].value;
    if (sdkCapability == MobileSdk.Capability.ActivityCollectionCapability) {
      mMainHandler.post(new Runnable(){
        @Override
        public void run() {
          enableCapability(sdkCapability, callback);
        }
      });
    } else {
      enableCapability(sdkCapability, callback);
    }
  }

  private void enableCapability(MobileSdk.Capability capability, Callback callback) {
    try {
      sdk.enableCapability(capability);
      callback.invoke(null, true);
    } catch (Exception e) {
      callback.invoke(e.getMessage(), false);
    }
  }

  @ReactMethod
  public void disableAndroidCapability(int capability, Callback callback) {
    try {
      sdk.disableCapability(Capabilities.values()[capability].value);
      callback.invoke(null, true);
    } catch (Exception e) {
      callback.invoke(e.getMessage(), false);
    }
  }

  @ReactMethod
  public void run(Callback errorCallback) {
    try {
      sdk.run();
    } catch (Exception e) {
      errorCallback.invoke(e.getMessage());
    }
  }

  @ReactMethod
  public void stop(Callback errorCallback) {
    try {
      sdk.stop();
    } catch (Exception e) {
      errorCallback.invoke(e.getMessage());
    }
  }

  @ReactMethod
  public void getCookies(Callback cookiesCallback) {
      Map<String, String> cookies = sdk.getCookies();
      WritableMap cookiesMap = Arguments.createMap();
      for (Map.Entry<String, String> entry : cookies.entrySet()) {
          cookiesMap.putString(entry.getKey(), entry.getValue());
      }
      cookiesCallback.invoke(cookiesMap);
  }
}
