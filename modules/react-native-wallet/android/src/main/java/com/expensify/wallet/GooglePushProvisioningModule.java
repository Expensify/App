package com.expensify.wallet;

import android.app.Activity;
import android.content.Intent;
import androidx.annotation.NonNull;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.BaseActivityEventListener;
import com.facebook.react.bridge.ReactMethod;
import com.google.android.gms.tapandpay.TapAndPay;
import static com.google.android.gms.tapandpay.TapAndPayStatusCodes.TAP_AND_PAY_NO_ACTIVE_WALLET;
import com.google.android.gms.tapandpay.TapAndPayClient;
import com.google.android.gms.tapandpay.issuer.PushTokenizeRequest;
import com.google.android.gms.tapandpay.issuer.TokenStatus;
import com.google.android.gms.tapandpay.issuer.UserAddress;
import com.google.android.gms.tasks.OnCanceledListener;
import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.OnFailureListener;
import com.google.android.gms.tasks.Task;
import com.google.android.gms.common.api.ApiException;
import android.util.Log;
import org.json.JSONObject;
import java.nio.charset.Charset;

import java.util.HashMap;
import java.util.Map;

public class GooglePushProvisioningModule extends ReactContextBaseJavaModule {
  private static final String MODULE_NAME = "GooglePushProvisioning";

  private static final int REQUEST_CODE_PUSH_TOKENIZE = 3;
  private static final int REQUEST_CREATE_WALLET = 4;

  public static final String ERROR_GET_TOKEN_STATUS = "GET_TOKEN_STATUS_ERROR";
  public static final String ERROR_GET_TOKEN_STATUS_FAILURE = "GET_TOKEN_STATUS_FAILURE";
  public static final String ERROR_GET_TOKEN_STATUS_CANCELED = "GET_TOKEN_STATUS_CANCELED";
  public static final String ERROR_GET_ACTIVE_WALLET_ID = "GET_ACTIVE_WALLET_ID_ERROR";
  public static final String ERROR_GET_ACTIVE_WALLET_ID_FAILURE = "GET_ACTIVE_WALLET_ID_FAILURE";
  public static final String ERROR_GET_ACTIVE_WALLET_ID_CANCELED = "GET_ACTIVE_WALLET_ID_CANCELED";
  public static final String ERROR_GET_STABLE_HARDWARE_ID = "GET_STABLE_HARDWARE_ID_ERROR";
  public static final String ERROR_GET_STABLE_HARDWARE_ID_FAILURE = "GET_STABLE_HARDWARE_ID_FAILURE";
  public static final String ERROR_GET_STABLE_HARDWARE_ID_CANCELED = "GET_STABLE_HARDWARE_ID_CANCELED";
  public static final String ERROR_GET_ENVIRONMENT = "GET_ENVIRONMENT_ERROR";
  public static final String ERROR_GET_ENVIRONMENT_FAILURE = "GET_ENVIRONMENT_FAILURE";
  public static final String ERROR_GET_ENVIRONMENT_CANCELED = "GET_ENVIRONMENT_CANCELED";
  public static final String ERROR_PUSH_PROVISION = "PUSH_PROVISION_ERROR";
  public static final String ERROR_PUSH_TOKENIZE_CANCELED = "E_PUSH_TOKENIZE_CANCELED";
  public static final String ERROR_PUSH_TOKENIZE_FAILED = "E_PUSH_TOKENIZE_FAILED";

  private static final String TSP_VISA = "VISA";
  private static final String TSP_MASTERCARD = "MASTERCARD";

  private Promise promise;

  private TapAndPayClient tapAndPayClient;

  private static final Map<String, Integer> TOKEN_PROVIDER_MAP = new HashMap<String, Integer>() {{
    put(TSP_VISA, TapAndPay.TOKEN_PROVIDER_VISA);
    put(TSP_MASTERCARD, TapAndPay.TOKEN_PROVIDER_MASTERCARD);
    // Add more if necessary
  }};

  private static final Map<String, Integer> CARD_NETWORK_MAP = new HashMap<String, Integer>() {{
    put(TSP_VISA, TapAndPay.CARD_NETWORK_VISA);
    put(TSP_MASTERCARD, TapAndPay.CARD_NETWORK_MASTERCARD);
    // Add more if necessary
  }};


  public GooglePushProvisioningModule(ReactApplicationContext reactContext) {
    super(reactContext);
    reactContext.addActivityEventListener(mActivityEventListener);
  }

  @Override
  public void initialize() {
    super.initialize();
    tapAndPayClient = TapAndPay.getClient(this.getCurrentActivity());
  }

  @Override
  public String getName() {
    return MODULE_NAME;
  }

  @ReactMethod
  public void getTokenStatus(String tsp, String tokenReferenceId, Promise promise) {
    int tokenServiceProvider = getTokenServiceProvider(tsp);
    tapAndPayClient.getTokenStatus(tokenServiceProvider, tokenReferenceId)
      .addOnCompleteListener(new OnCompleteListener<TokenStatus>() {
        @Override
        public void onComplete(@NonNull Task<TokenStatus> task) {
          if (task.isSuccessful()) {
            int tokenStateInt = task.getResult().getTokenState();
            promise.resolve(tokenStateInt);
          } else {
            promise.reject(ERROR_GET_TOKEN_STATUS, "Error retrieving token status");
          }
        }
      })
      .addOnFailureListener(new OnFailureListener() {
        @Override
        public void onFailure(@NonNull Exception e) {
          promise.reject(ERROR_GET_TOKEN_STATUS_FAILURE, e);
        }
      })
      .addOnCanceledListener(new OnCanceledListener() {
        @Override
        public void onCanceled() {
          promise.reject(ERROR_GET_TOKEN_STATUS_CANCELED, "Token status retrieval canceled");
        }
      });
  }

  @ReactMethod
  public void getActiveWalletID(Promise promise) {
    tapAndPayClient.getActiveWalletId()
      .addOnCompleteListener(new OnCompleteListener<String>() {
        @Override
        public void onComplete(@NonNull Task<String> task) {
          if (task.isSuccessful()) {
            String walletId = task.getResult();
            promise.resolve(walletId);
          } else {
            ApiException apiException = (ApiException) task.getException();
            Log.i(MODULE_NAME, apiException.getMessage());
            if (apiException.getStatusCode() == TAP_AND_PAY_NO_ACTIVE_WALLET) {
              // If no Google Pay wallet is found, create one and then call
              // getActiveWalletId() again.
              tapAndPayClient.createWallet(getCurrentActivity(), REQUEST_CREATE_WALLET);
              getActiveWalletID(promise);
            } else {
              // Failed to get active wallet ID
              promise.reject(ERROR_GET_ACTIVE_WALLET_ID, task.getException());
            }
          }
        }
      })
      .addOnFailureListener(new OnFailureListener() {
        @Override
        public void onFailure(@NonNull Exception e) {
          Log.i(MODULE_NAME, "onFailure (getActiveWalletID) - " + e.getMessage());
          promise.reject(ERROR_GET_ACTIVE_WALLET_ID_FAILURE, e);
        }
      })
      .addOnCanceledListener(new OnCanceledListener() {
        @Override
        public void onCanceled() {
          Log.i(MODULE_NAME, "onCanceled (getActiveWalletID) - ");
          promise.reject(ERROR_GET_ACTIVE_WALLET_ID_CANCELED, "Active wallet ID retrieval canceled");
        }
      });
  }

  @ReactMethod
  public void getStableHardwareId(Promise promise) {
    tapAndPayClient.getStableHardwareId()
      .addOnCompleteListener(new OnCompleteListener<String>() {
        @Override
        public void onComplete(@NonNull Task<String> task) {
          if (task.isSuccessful()) {
            promise.resolve(task.getResult());
          } else {
            promise.reject(ERROR_GET_STABLE_HARDWARE_ID, task.getException());
          }
        }
      })
      .addOnFailureListener(new OnFailureListener() {
        @Override
        public void onFailure(@NonNull Exception e) {
          promise.reject(ERROR_GET_STABLE_HARDWARE_ID_FAILURE, e);
        }
      })
      .addOnCanceledListener(new OnCanceledListener() {
        @Override
        public void onCanceled() {
          promise.reject(ERROR_GET_STABLE_HARDWARE_ID_CANCELED, "Stable hardware ID retrieval canceled");
        }
      });
  }

  @ReactMethod
  public void getEnvironment(Promise promise) {
    tapAndPayClient.getEnvironment()
      .addOnCompleteListener(new OnCompleteListener<String>() {
        @Override
        public void onComplete(@NonNull Task<String> task) {
          if (task.isSuccessful()) {
            promise.resolve(task.getResult());
          } else {
            promise.reject(ERROR_GET_ENVIRONMENT, task.getException());
          }
        }
      })
      .addOnFailureListener(new OnFailureListener() {
        @Override
        public void onFailure(@NonNull Exception e) {
          promise.reject(ERROR_GET_ENVIRONMENT_FAILURE, e);
        }
      })
      .addOnCanceledListener(new OnCanceledListener() {
        @Override
        public void onCanceled() {
          promise.reject(ERROR_GET_ENVIRONMENT_CANCELED, "Environment retrieval canceled");
        }
      });
  }

  @ReactMethod
  public void pushProvision(String opc, String tsp, String clientName, String lastDigits, String addressJson, Promise promise) {
    try {
      this.promise = promise;
      JSONObject address = new JSONObject(addressJson);
      int cardNetwork = getCardNetwork(tsp);
      int tokenServiceProvider = getTokenServiceProvider(tsp);

      UserAddress userAddress = UserAddress.newBuilder()
        .setName(address.getString("name"))
        .setAddress1(address.getString("addressOne"))
        .setAddress1(address.getString("addressTwo"))
        .setLocality(address.getString("locality"))
        .setAdministrativeArea(address.getString("administrativeArea"))
        .setCountryCode(address.getString("countryCode"))
        .setPostalCode(address.getString("postalCode"))
        .setPhoneNumber(address.getString("phoneNumber"))
        .build();

      PushTokenizeRequest pushTokenizeRequest = new PushTokenizeRequest.Builder()
        .setOpaquePaymentCard(opc.getBytes(Charset.forName("UTF-8")))
        .setNetwork(cardNetwork)
        .setTokenServiceProvider(tokenServiceProvider)
        .setDisplayName(clientName)
        .setLastDigits(lastDigits)
        .setUserAddress(userAddress)
        .build();
        
      Activity currentActivity = getCurrentActivity();
      tapAndPayClient.pushTokenize(currentActivity, pushTokenizeRequest, REQUEST_CODE_PUSH_TOKENIZE);

    } catch (Exception e) {
      this.promise.reject(ERROR_PUSH_PROVISION, e);
    }
  }

  private int getTokenServiceProvider(String tsp) {
    Integer provider = TOKEN_PROVIDER_MAP.get(tsp.toUpperCase());
    if (provider != null) {
      return provider;
    }
    throw new IllegalArgumentException("Unsupported token service provider: " + tsp);
  }

  private int getCardNetwork(String tsp) {
    Integer network = CARD_NETWORK_MAP.get(tsp.toUpperCase());
    if (network != null) {
      return network;
    }
    throw new IllegalArgumentException("Unsupported card network: " + tsp);
  }

  private final ActivityEventListener mActivityEventListener = new BaseActivityEventListener() {
        @Override
        public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {
            super.onActivityResult(activity, requestCode, resultCode, data);
            if (requestCode == REQUEST_CODE_PUSH_TOKENIZE && promise != null) {
                if (resultCode == Activity.RESULT_OK) {
                    // The user successfully added the card to Google Pay.
                    promise.resolve("Card successfully added to Google Pay");
                } else if (resultCode == Activity.RESULT_CANCELED) {
                    // The user canceled the operation.
                    promise.reject(ERROR_PUSH_TOKENIZE_CANCELED, "User canceled the operation");
                } else {
                    // Handle other result codes or errors here.
                    promise.reject(ERROR_PUSH_TOKENIZE_FAILED, "Push tokenization failed with result code: " + resultCode + " and data: " + data);
                }
            }
        }
    };
}
