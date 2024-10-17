# react-native-wallet - Push Provisioning Integration

A React Native library for integrating Apple Pay and Google Pay, allowing for easy tokenization of virtual cards.

## iOS Integration

### ApplePushProvisioning Module

The `ApplePushProvisioning` module provides functionality to interact with Apple Pay, including adding payment passes and completing the provisioning process.

Ensure your Xcode project is configured with the necessary entitlements for [Apple Pay](https://developer.apple.com/documentation/passkit_apple_pay_and_wallet/pkaddpaymentpassviewcontroller?language=objc).

#### ApplePushProvisioning API

* `canAddPaymentPass()`
    * **Description**: Checks if a payment pass can be added.
    * **Returns**: `Promise<boolean>`

* `startAddPaymentPass(request)`
    * **Description**: Starts the process of adding a payment pass.
    * **Parameters**:
        * `request`: An object containing `last4` (last 4 digits of the card) and `cardHolderName` (card holder's name).
    * **Returns**: `Promise<void>`

* `completeAddPaymentPass(request)`
    * **Description**: Completes the process of adding a payment pass.
    * **Parameters**:
        * `request`: An object containing `activation`, `encryptedData`, and `ephemeralKey`.
    * **Returns**: `Promise<void>`

* **Event: `getPassAndActivation`**
    * **Description**: Triggered when the app needs to pass the `certificate chain`, `nonce`, and `nonce signature` to Apple Pay.
    * **Details**: 
      - You will need to fetch the certificate chain, nonce, and nonce signature from your backend or server (typically provided by the card issuer).
      - These values are required for securely provisioning the card into Apple Pay, as they encrypt sensitive data for secure transfer.

### Example Usage

```typescript
    import PushProvisioning from '@your-org/push-provisioning';

    PushProvisioning.Apple.canAddPaymentPass().then(canAdd => {
    if (canAdd) {
        return PushProvisioning.Apple.startAddPaymentPass({
        last4: '1234',
        cardHolderName: 'John Doe',
        });
    } else {
        throw new Error('Cannot add payment pass');
    }
    }).then(() => {
    console.log('Payment pass addition started');
    }).catch(error => {
    console.error('Error:', error);
    });

    // Listening for event to get certificate, nonce, and nonceSignature
    PushProvisioning.Apple.addEventListener('getPassAndActivation', (event) => {
      const { certificateLeaf, certificateSubCA, nonce, nonceSignature } = event.data;
      console.log('Certificate and nonce details:', certificateLeaf, certificateSubCA, nonce, nonceSignature);
      // Send these to the backend to complete provisioning
    });
```

## Google Pay Integration

### GooglePushProvisioning Module

The `GooglePushProvisioning` module provides functionality to interact with Google Pay, including token management and wallet provisioning.

Follow the Google Pay setup guide for [Android Push Provisioning API](https://developers.google.com/pay/issuers/apis/push-provisioning/android/) in your project's documentation.

#### GooglePushProvisioning API

* `getTokenStatus(tsp, tokenReferenceId)`
    * **Description**: Retrieves the status of a token.
    * **Parameters**:
        * `tsp`: Token Service Provider (`'VISA'` or `'MASTERCARD'`).
        * `tokenReferenceId`: The token reference ID.
    * **Returns**: `Promise<number>`

* `getActiveWalletID()`
    * **Description**: Retrieves the active wallet ID.
    * **Returns**: `Promise<string>`

* `getStableHardwareId()`
    * **Description**: Retrieves the stable hardware ID.
    * **Returns**: `Promise<string>`

* `getEnvironment()`
    * **Description**: Retrieves the environment.
    * **Returns**: `Promise<string>`

* `pushProvision(request)`
    * **Description**: Initiates the push provisioning process.
    * **Parameters**:
        * `request`: An object containing `opc` (opaque payment card), `tsp` (token service provider), `clientName`, `lastDigits`, and `address`.
    * **Returns**: `Promise<string>`

### Example Usage:

```typescript
    import PushProvisioning from '@your-org/push-provisioning';

    PushProvisioning.Google.getActiveWalletID().then(walletId => {
    console.log('Active Wallet ID:', walletId);
    }).catch(error => {
    console.error('Error:', error);
    });
```