type NavigationCallback = () => void;

type ContinueNavigationAfterDiscardParams = {
    clearBlockedNavigation: () => void;
    clearNavigationCallback: () => void;
    continueNavigation: () => void;
    getNavigationCallback: () => NavigationCallback | undefined;
    isFocused: boolean;
    onConfirmWhenUnfocused: (() => void) | undefined;
    suppressDiscardPrompt: () => void;
};

function continueNavigationAfterDiscard({
    clearBlockedNavigation,
    clearNavigationCallback,
    continueNavigation,
    getNavigationCallback,
    isFocused,
    onConfirmWhenUnfocused,
    suppressDiscardPrompt,
}: ContinueNavigationAfterDiscardParams): void {
    const navigationCallback = getNavigationCallback();
    clearNavigationCallback();
    if (navigationCallback) {
        suppressDiscardPrompt();
        navigationCallback();
        return;
    }

    if (!isFocused && onConfirmWhenUnfocused) {
        suppressDiscardPrompt();
        clearBlockedNavigation();
        onConfirmWhenUnfocused();
        return;
    }

    continueNavigation();
}

export default continueNavigationAfterDiscard;
