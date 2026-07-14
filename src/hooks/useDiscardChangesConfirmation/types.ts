type UseDiscardChangesConfirmationOptions = {
    /** Returns whether the screen has unsaved changes. The hook already gates on focus and an in-progress save, so this should report only real dirtiness. */
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

type DiscardChangesConfirmation = {
    /** Suppress the discard prompt while an intentional save navigates away. Pass `false` to clear it if the save aborts without navigating. */
    notifySaving: (isSaving?: boolean) => void;
};

export default UseDiscardChangesConfirmationOptions;
export type {DiscardChangesConfirmation};
