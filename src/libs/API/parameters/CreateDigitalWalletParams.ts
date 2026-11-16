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
};

type WalletAuthenticationParams = {signedChallenge: string; authenticationMethod: AuthTypeInfo['marqetaValue']} | {signedChallenge?: never; authenticationMethod?: never};

type CreateDigitalWalletParams = (CreateDigitalAppleWalletParams | CreateDigitalGoogleWalletParams) & WalletAuthenticationParams;

export default CreateDigitalWalletParams;
