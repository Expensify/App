import type {AuthTypeInfo} from '@libs/MultifactorAuthentication/shared/types';

type CreateDigitalAppleWalletParams = {
    platform: 'ios';
    appVersion: string;
    // stringified {"certificates": string[]} object
    certificates: string;
    nonce: string;
    nonceSignature: string;
    cardID: number;
};

type CreateDigitalGoogleWalletParams = {
    platform: 'android';
    appVersion: string;
    walletAccountID: string;
    deviceID: string;
    cardID: number;

    /** Google's server session ID from the Unified Push Provisioning callback, only sent on the call that asks for the Google OPC */
    serverSessionID?: string;

    /** Token requestor ID of the tokenization target, digits only and up to 15 characters */
    tokenRequestorID?: string;
};

type WalletAuthenticationParams = {signedChallenge: string; authenticationMethod: AuthTypeInfo['marqetaValue']} | {signedChallenge?: never; authenticationMethod?: never};

type CreateDigitalWalletParams = (CreateDigitalAppleWalletParams | CreateDigitalGoogleWalletParams) & WalletAuthenticationParams;

export default CreateDigitalWalletParams;
