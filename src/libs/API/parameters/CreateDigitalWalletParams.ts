type CreateDigitalAppleWalletParams = {
    platform: string;
    appVersion: string;
    // stringified {"certificates": string[]}
    certificates: string;
    nonce: string;
    nonceSignature: string;
};

type CreateDigitalGoogleWalletParams = {
    platform: string;
    appVersion: string;
    walletAccountID: string;
    deviceID: string;
};

type CreateDigitalWalletParams = CreateDigitalAppleWalletParams | CreateDigitalGoogleWalletParams;

export type {CreateDigitalAppleWalletParams, CreateDigitalGoogleWalletParams};
export default CreateDigitalWalletParams;
