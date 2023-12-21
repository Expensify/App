type ClientConfigI = {
    clientId?: string | undefined;
    redirectURI?: string | undefined;
    scope?: string | undefined;
    state?: string | undefined;
    nonce?: string | undefined;
    usePopup?: boolean | undefined;
};

type AuthI = {
    init: (config: ClientConfigI) => void;
    signIn: (signInConfig?: ClientConfigI) => Promise<SignInResponseI>;
    renderButton: () => void;
};

type AppleID = {
    auth: AuthI;
};

declare global {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface Window {
        AppleID: AppleID;
        appleAuthScriptLoaded: boolean;
    }
}

// We used the export {} line to mark this file as an external module
export {};
