type InitialFocusParams = {
    isOpenedViaKeyboard: boolean;
    containerElementRef: unknown;
};

type FocusRestoreModule = {
    getInitialFocusTarget: (params: InitialFocusParams) => HTMLElement | false;
    restoreCapturedAnchorFocus: (capturedAnchorElement: HTMLElement | null) => void;
    shouldTryKeyboardInitialFocus: (isOpenedViaKeyboard: boolean) => boolean;
    isWebPlatform: (platform: string) => boolean;
};

export type {FocusRestoreModule, InitialFocusParams};
