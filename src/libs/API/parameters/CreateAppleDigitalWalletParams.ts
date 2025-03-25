type CreateAppleSigitalWalletParams = {
    platform: string;
    appVersion: string;
    certificates: string[];
    nonce: string;
    nonceSignature: string;
};

export default CreateAppleSigitalWalletParams;
