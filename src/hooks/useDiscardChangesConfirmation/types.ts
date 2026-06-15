type UseDiscardChangesConfirmationOptions = {
    getHasUnsavedChanges: () => boolean;
    onCancel?: () => void;
    onVisibilityChange?: (visible: boolean) => void;
    onConfirm?: () => void | Promise<void>;

    /**
     * Discard action for confirming a tab switch. Provide it to guard tab switches inside an `OnyxTabNavigator`.
     * Can differ from `onConfirm` (nav-away)
     */
    onTabSwitchDiscard?: () => void | Promise<void>;
};

export default UseDiscardChangesConfirmationOptions;
