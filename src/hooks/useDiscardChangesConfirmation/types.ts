type UseDiscardChangesConfirmationOptions = {
    getHasUnsavedChanges: () => boolean;
    onCancel?: () => void;
    onVisibilityChange?: (visible: boolean) => void;
    onConfirm?: () => void | Promise<void>;

    /**
     * Discard action to run when the user confirms leaving via a tab switch (as opposed to navigating away).
     * Provide this when the hook is used inside an `OnyxTabNavigator` tab screen to also guard tab switches.
     * It can differ from `onConfirm`: e.g. tab-switch clears the in-flow fields, while nav-away abandons the draft
     */
    onTabSwitchDiscard?: () => void | Promise<void>;
};

export default UseDiscardChangesConfirmationOptions;
