import {TurboModule, TurboModuleRegistry} from 'react-native';

export interface Spec extends TurboModule {
    // Method to get device details for wallet creation
    getDeviceDetails(): Promise<{
        walletAccountID?: string; // Android
        deviceID?: string;        // Android
        // Add any iOS-specific details if needed
    }>;

    // Method to handle wallet creation response
    handleWalletCreationResponse(data: {
        // Common return values
        cardToken: string;
        // Android-specific return values
        opaquePaymentCard?: string;
        userAddress?: string;
        network?: string;
        tokenServiceProvider?: string;
        displayName?: string;
        lastDigits?: string;
        // iOS-specific return values
        encryptedPassData?: string;
        activationData?: string;
        ephemeralPublicKey?: string;
    }): Promise<boolean>;
}

export default TurboModuleRegistry.get<Spec>('RTNWallet');
