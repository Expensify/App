type AppleIDSignInOnSuccessEvent = {
    detail: {
        authorization: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            id_token: string;
        };
    };
};

type AppleIDSignInOnFailureEvent = {
    detail: {
        error: string;
    };
};

declare global {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface DocumentEventMap extends GlobalEventHandlersEventMap {
        AppleIDSignInOnSuccess: AppleIDSignInOnSuccessEvent;
        AppleIDSignInOnFailure: AppleIDSignInOnFailureEvent;
    }
}

export type {AppleIDSignInOnFailureEvent, AppleIDSignInOnSuccessEvent};
