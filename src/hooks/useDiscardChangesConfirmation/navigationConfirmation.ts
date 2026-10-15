type NavigationCallback = () => void;
type NavigationCallbackRef = {current: NavigationCallback | undefined};

type ConfirmNavigationParams = {
    hasUnsavedChanges: () => boolean;
    isDiscardModalOpen: {current: boolean};
    navigationCallbackRef: NavigationCallbackRef;
    showDiscardModal: () => void;
};

type ContinueNavigationAfterDiscardParams = {
    clearBlockedNavigation: () => void;
    continueNavigation: () => void;
    isFocused: boolean;
    navigationCallbackRef: NavigationCallbackRef;
    onConfirmWhenUnfocused: (() => void) | undefined;
    suppressDiscardPrompt: () => void;
};

function createConfirmNavigation({
    hasUnsavedChanges,
    isDiscardModalOpen,
    navigationCallbackRef,
    showDiscardModal,
}: ConfirmNavigationParams): (navigationCallback: NavigationCallback) => void {
    return (navigationCallback: NavigationCallback) => {
        if (!hasUnsavedChanges()) {
            navigationCallback();
            return;
        }

        if (isDiscardModalOpen.current) {
            return;
        }

        navigationCallbackRef.current = navigationCallback;
        showDiscardModal();
    };
}

function continueNavigationAfterDiscard({
    clearBlockedNavigation,
    continueNavigation,
    isFocused,
    navigationCallbackRef,
    onConfirmWhenUnfocused,
    suppressDiscardPrompt,
}: ContinueNavigationAfterDiscardParams): void {
    const navigationCallback = navigationCallbackRef.current;
    navigationCallbackRef.current = undefined;
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

export {continueNavigationAfterDiscard};
export default createConfirmNavigation;
