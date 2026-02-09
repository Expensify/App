type InitialFocusParams = {
    isOpenedViaKeyboard: boolean;
    containerElementRef: unknown;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getInitialFocusTarget(_params: InitialFocusParams): HTMLElement | false {
    return false;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function restoreCapturedAnchorFocus(_capturedAnchorElement: HTMLElement | null): void {}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function shouldTryKeyboardInitialFocus(_isOpenedViaKeyboard: boolean): boolean {
    return false;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function isWebPlatform(_platform: string): boolean {
    return false;
}

export {getInitialFocusTarget, restoreCapturedAnchorFocus, shouldTryKeyboardInitialFocus, isWebPlatform};
