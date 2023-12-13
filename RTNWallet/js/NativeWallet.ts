import { TurboModule, TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
    // Method to create a digital wallet with platform-specific parameters
    createDigitalWallet(params: {
        // General parameter for both platforms
        appVersion: string,
        // Android-specific parameters
        walletAccountID?: string,
        deviceID?: string,
        // iOS-specific parameters
        certificates?: string,
        nonce?: string,
        nonceSignature?: string
    }): Promise<{
        // General return value for both platforms
        cardToken: string,
        // Android-specific return values
        opaquePaymentCard?: string,
        userAddress?: string,
        network?: string,
        tokenServiceProvider?: string,
        displayName?: string,
        lastDigits?: string,
        // iOS-specific return values
        encryptedPassData?: string,
        activationData?: string,
        ephemeralPublicKey?: string
    }>;

    // Sets the callback for wallet creation
    setCreateWalletCallback(callback: Function): Promise<void>;

    // Sets the callback for refreshing card list
    setRefreshCardListCallback(callback: Function): Promise<void>;

    // Sets the callback for handling errors
    setHadErrorCallback(callback: Function): Promise<void>;

    // Gets device and wallet information
    getDeviceInfo(): Promise<{ walletId: string, hardwareId: string }>;

    handleWalletCreationResponse(data: object): Promise<boolean>;

    // Registers for data changes in the wallet
    registerDataChanged(): Promise<void>;
}

export default TurboModuleRegistry.get<Spec>('RTNWallet');
