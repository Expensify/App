type ClientConfig = {
    clientId?: string;
    redirectURI?: string;
    scope?: string;
    state?: string;
    nonce?: string;
    usePopup?: boolean;
};

type Auth = {
    init: (config: ClientConfig) => void;
    signIn: (signInConfig?: ClientConfig) => Promise<SignInResponseI>;
    renderButton: () => void;
};

type AppleID = {
    auth: Auth;
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
