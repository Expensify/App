type ActionPayloadParams = {
    screen?: string;
    params?: unknown;
    path?: string;
};

type ActionPayload = {
    params?: ActionPayloadParams;
};

type LinkToOptions = {
    // To explicitly set the action type to replace.
    forceReplace?: boolean;
    // Callback to execute after the navigation transition animation completes.
    afterTransition?: () => void;
    // If true, waits for ongoing transitions to finish before navigating. Defaults to false (navigates immediately).
    waitForTransition?: boolean;
};

export type {ActionPayload, LinkToOptions};
