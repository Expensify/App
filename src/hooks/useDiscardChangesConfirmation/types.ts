type UseDiscardChangesConfirmationOptions = {
    /** Returns whether the screen has unsaved changes. The hook already gates on focus and an in-progress save, so this should report only real dirtiness. */
    getHasUnsavedChanges: () => boolean;
    onCancel?: () => void;
    onVisibilityChange?: (visible: boolean) => void;
    onConfirm?: () => void | Promise<void>;
    onTabSwitchDiscard?: () => void | Promise<void>;
    /**
     * When the user clicks outside the RHP and picks Discard, close the whole RHP, as that click does when there's nothing to discard,
     * instead of only this page. Going back still closes only this page. The create expense steps set it, so discarding closes the whole flow.
     */
    shouldCloseRHPOnDiscard?: boolean;
};

type DiscardChangesConfirmation = {
    /** Suppress the discard prompt during an intentional navigation (a save, or a redirect such as the billing restriction). Pass `false` to clear it if that navigation aborts without leaving. */
    suppressDiscardPrompt: (shouldSuppress?: boolean) => void;
};

export default UseDiscardChangesConfirmationOptions;
export type {DiscardChangesConfirmation};
