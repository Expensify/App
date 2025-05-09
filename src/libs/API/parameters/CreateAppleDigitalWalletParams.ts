type CreateAppleDigitalWalletParams = {
    platform: string;
    appVersion: string;
    // stringified {"certificates": string[]}
    certificates: string;
    nonce: string;
    nonceSignature: string;
};

export default CreateAppleDigitalWalletParams;
