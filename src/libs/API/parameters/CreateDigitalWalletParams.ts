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

type CreateDigitalWalletParams = CreateDigitalAppleWalletParams | CreateDigitalGoogleWalletParams;

export type {CreateDigitalAppleWalletParams, CreateDigitalGoogleWalletParams};
export default CreateDigitalWalletParams;
