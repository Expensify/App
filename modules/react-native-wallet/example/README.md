# React Native Wallet Example App

This app demonstrates how to verify that the `react-native-wallet` library is correctly integrated with **Apple Pay** and **Google Pay** for virtual cards. The focus is to ensure that the app fetches the necessary parameters required for provisioning a card to these wallets, using native methods.

## Purpose

First, we aim to verify that we can fetch the following parameters to support card tokenization in Apple Pay and Google Pay:

| **Mutual Parameters**   | **Android Specific Parameters** | **iOS Specific Parameters** |
|--------------------------|---------------------------------|----------------------------|
|1.`appVersion`            | 1.`walletAccountID`             | 1.`certificates`            |
|                          | 2.`deviceID`                   | 2.`nonce`                   |
|                          |                                 | 3.`nonceSignature`          |

The main focus of this example is to validate that these values are correctly fetched from the native modules, which are required for tokenizing a virtual card into Apple Pay or Google Pay.


## Backend Dependencies

While this app fetches the parameters listed above, note that **the app itself does not generate these values**. These values must be obtained from the **server** (issuer’s server or a third-party service that generates secure transaction data). For testing purposes, mock values are used here.

## Android Setup

The **Android Push Provisioning API** is used for adding a card to Google Wallet. You can find more details here:
[Android Push Provisioning API](https://developers.google.com/pay/issuers/apis/push-provisioning/android?hl=pt-br)

Make sure that you have added the following permissions to your `AndroidManifest.xml`:
```xml
<uses-permission android:name="com.google.android.gms.wallet.permission.BIND_WALLET_SERVICE" />
```

### Android Methods Tested:

- **`getActiveWalletID`**: Fetches the active Google Wallet account ID.
- **`getStableHardwareId`**: Fetches the hardware ID of the device, which is used for security purposes.
- **`pushProvision`**: Initiates the process of provisioning a card into Google Pay, using mock data in this example.

## iOS Setup

On iOS, the **PKAddPaymentPassViewController** class is used to initiate and manage the addition of a payment pass to Apple Wallet. This is essential for Apple Pay integration. More information can be found in the Apple documentation:
[PKAddPaymentPassViewController Documentation](https://developer.apple.com/documentation/passkit_apple_pay_and_wallet/pkaddpaymentpassviewcontroller)

### iOS Permissions

Ensure that the following permissions are added to your `Info.plist`:
```xml
<key>com.apple.developer.in-app-payments</key>
<array>
    <string>Visa</string>  <!-- Add other payment networks as needed -->
</array>
```

### iOS Methods Tested:

- **`canAddPaymentPass`**: Verifies if a payment pass can be added to Apple Wallet.
- **`startAddPaymentPass`**: Initiates the process of adding a virtual card to Apple Wallet using mock cardholder data.
- **`completeAddPaymentPass`**: Completes the payment pass process with mock data for activation, encrypted pass data, and the ephemeral public key.

## Running the App

Once the necessary permissions and setup are complete, you can run the app to test if the `react-native-wallet` library is linked correctly and if the methods return the expected results.

### iOS:
```bash
npx react-native run-ios
```

### Android:
```bash
npx react-native run-android
```

## Logs & Output

Logs will appear directly in the app, indicating whether the native methods are successfully called and what values they return. These logs help validate that the required parameters are being fetched correctly.

#### Example output:

```yaml
canAddPaymentPass: true
startAddPaymentPass: { success: true }
completeAddPaymentPass: { success: true, activationData: '...' }
getActiveWalletID: MockedWalletID
getStableHardwareId: MockedHardwareId
pushProvision: { success: true, opc: 'someOpc' }
```

## Conclusion

The purpose of this app is not to test the entire card provisioning flow but to ensure that we can call the necessary native methods to work with the required parameters for Apple Pay and Google Pay.