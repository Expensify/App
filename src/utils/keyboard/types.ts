type DismissKeyboardOptions = {
    shouldSkipSafari?: boolean;
    afterTransition?: () => void;
};

type SimplifiedKeyboardEvent = {
    height?: number;
};

export type {DismissKeyboardOptions, SimplifiedKeyboardEvent};
