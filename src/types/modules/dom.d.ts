// eslint-disable-next-line rulesdir/no-inline-named-export
export type AppleIDSignInOnSuccessEvent = {
    detail: {
        authorization: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            id_token: string;
        };
    };
};

// eslint-disable-next-line rulesdir/no-inline-named-export
export type AppleIDSignInOnFailureEvent = {
    detail: {
        error: string;
    };
};

type AppleAuthEventMap = {
    AppleIDSignInOnSuccess: AppleIDSignInOnSuccessEvent;
    AppleIDSignInOnFailure: AppleIDSignInOnFailureEvent;
};

declare global {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface Document {
        addEventListener<K extends keyof AppleAuthEventMap>(type: K, listener: (this: Document, ev: CustomEventMap[K]) => void): void;
        removeEventListener<K extends keyof AppleAuthEventMap>(type: K, listener: (this: Document, ev: CustomEventMap[K]) => void): void;
        dispatchEvent<K extends keyof CustomEventMap>(ev: CustomEventMap[K]): void;
    }
}
export {};
