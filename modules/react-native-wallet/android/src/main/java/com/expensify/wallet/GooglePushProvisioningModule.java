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
import static com.google.android.gms.tapandpay.TapAndPayStatusCodes.TAP_AND_PAY_TOKEN_NOT_FOUND;
import com.google.android.gms.tapandpay.TapAndPayClient;
import com.google.android.gms.tapandpay.issuer.PushTokenizeRequest;
import com.google.android.gms.tapandpay.issuer.TokenStatus;
import com.google.android.gms.tapandpay.issuer.UserAddress;
import com.google.android.gms.tasks.OnCanceledListener;
import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.OnFailureListener;
import com.google.android.gms.tasks.Task;
import java.nio.charset.Charset;

import com.google.android.gms.common.api.ApiException;
import android.util.Log;

import org.json.JSONObject;

public class GooglePushProvisioningModule extends ReactContextBaseJavaModule {
  private static final String TAG = "GooglePushProvisioning";
  private static final int REQUEST_CODE_PUSH_TOKENIZE = 3;
  private static final int REQUEST_CREATE_WALLET = 4;
  private Promise promise;

  public GooglePushProvisioningModule(ReactApplicationContext reactContext) {
    super(reactContext);
    reactContext.addActivityEventListener(mActivityEventListener);
  }

  private TapAndPayClient getTapAndPayClient() {
    return TapAndPay.getClient(getCurrentActivity());
  }

  @Override
  public String getName() {
    return "GooglePushProvisioning";
  }

  @ReactMethod
  public void getTokenStatus(String tsp, String tokenReferenceId, Promise promise) {
    int tokenServiceProvider = tsp.equalsIgnoreCase("VISA") ? TapAndPay.TOKEN_PROVIDER_VISA : TapAndPay.TOKEN_PROVIDER_MASTERCARD;
    getTapAndPayClient().getTokenStatus(tokenServiceProvider, tokenReferenceId)
      .addOnCompleteListener(new OnCompleteListener<TokenStatus>() {
        @Override
        public void onComplete(@NonNull Task<TokenStatus> task) {
          if (task.isSuccessful()) {
            int tokenStateInt = task.getResult().getTokenState();
            promise.resolve(tokenStateInt);
          } else {
            promise.reject("GET_TOKEN_STATUS_ERROR", "Error retrieving token status");
          }
        }
      })
      .addOnFailureListener(new OnFailureListener() {
        @Override
        public void onFailure(@NonNull Exception e) {
          promise.reject("GET_TOKEN_STATUS_FAILURE", e);
        }
      })
      .addOnCanceledListener(new OnCanceledListener() {
        @Override
        public void onCanceled() {
          promise.reject("GET_TOKEN_STATUS_CANCELED", "Token status retrieval canceled");
        }
      });
  }

  @ReactMethod
  public void getActiveWalletID(Promise promise) {
    getTapAndPayClient().getActiveWalletId()
      .addOnCompleteListener(new OnCompleteListener<String>() {
        @Override
        public void onComplete(@NonNull Task<String> task) {
          if (task.isSuccessful()) {
            String walletId = task.getResult();
            promise.resolve(walletId);
          } else {
            ApiException apiException = (ApiException) task.getException();
            Log.i(TAG, apiException.getMessage());
            if (apiException.getStatusCode() == TAP_AND_PAY_NO_ACTIVE_WALLET) {
              // If no Google Pay wallet is found, create one and then call
              // getActiveWalletId() again.
              getTapAndPayClient().createWallet(getCurrentActivity(), REQUEST_CREATE_WALLET);
              getActiveWalletID(promise);
            } else {
              // Failed to get active wallet ID
              promise.reject("GET_ACTIVE_WALLET_ID_ERROR", task.getException());
            }
          }
        }
      })
      .addOnFailureListener(new OnFailureListener() {
        @Override
        public void onFailure(@NonNull Exception e) {
          Log.i(TAG, "onFailure (getActiveWalletID) - " + e.getMessage());
          promise.reject("GET_ACTIVE_WALLET_ID_FAILURE", e);
        }
      })
      .addOnCanceledListener(new OnCanceledListener() {
        @Override
        public void onCanceled() {
          Log.i(TAG, "onCanceled (getActiveWalletID) - ");
          promise.reject("GET_ACTIVE_WALLET_ID_CANCELED", "Active wallet ID retrieval canceled");
        }
      });
  }

  @ReactMethod
  public void getStableHardwareId(Promise promise) {
    getTapAndPayClient().getStableHardwareId()
      .addOnCompleteListener(new OnCompleteListener<String>() {
        @Override
        public void onComplete(@NonNull Task<String> task) {
          if (task.isSuccessful()) {
            promise.resolve(task.getResult());
          } else {
            promise.reject("GET_STABLE_HARDWARE_ID_ERROR", task.getException());
          }
        }
      })
      .addOnFailureListener(new OnFailureListener() {
        @Override
        public void onFailure(@NonNull Exception e) {
          promise.reject("GET_STABLE_HARDWARE_ID_FAILURE", e);
        }
      })
      .addOnCanceledListener(new OnCanceledListener() {
        @Override
        public void onCanceled() {
          promise.reject("GET_STABLE_HARDWARE_ID_CANCELED", "Stable hardware ID retrieval canceled");
        }
      });
  }

  @ReactMethod
  public void getEnvironment(Promise promise) {
    getTapAndPayClient().getEnvironment()
      .addOnCompleteListener(new OnCompleteListener<String>() {
        @Override
        public void onComplete(@NonNull Task<String> task) {
          if (task.isSuccessful()) {
            promise.resolve(task.getResult());
          } else {
            promise.reject("GET_ENVIRONMENT_ERROR",  task.getException());
          }
        }
      })
      .addOnFailureListener(new OnFailureListener() {
        @Override
        public void onFailure(@NonNull Exception e) {
          promise.reject("GET_ENVIRONMENT_FAILURE", e);
        }
      })
      .addOnCanceledListener(new OnCanceledListener() {
        @Override
        public void onCanceled() {
          promise.reject("GET_ENVIRONMENT_CANCELED", "Environment retrieval canceled");
        }
      });
  }

  @ReactMethod
  public void pushProvision(String opc, String tsp, String clientName, String lastDigits, String addressJson, Promise promise) {
    try {
      this.promise = promise;
      JSONObject address = new JSONObject(addressJson);
      int cardNetwork = tsp.equals("VISA") ? TapAndPay.CARD_NETWORK_VISA : TapAndPay.CARD_NETWORK_MASTERCARD;
      int tokenServiceProvider = tsp.equals("VISA") ? TapAndPay.TOKEN_PROVIDER_VISA : TapAndPay.TOKEN_PROVIDER_MASTERCARD;

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
      getTapAndPayClient().pushTokenize(currentActivity, pushTokenizeRequest, REQUEST_CODE_PUSH_TOKENIZE);

    } catch (Exception e) {
      this.promise.reject("PUSH_PROVISION_ERROR", e);
    }
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
                    promise.reject("E_PUSH_TOKENIZE_CANCELED", "User canceled the operation");
                } else {
                    // Handle other result codes or errors here.
                    promise.reject("E_PUSH_TOKENIZE_FAILED", "Push tokenization failed with result code: " + resultCode + " and data: " + data);
                }
            }
        }
    };
}
