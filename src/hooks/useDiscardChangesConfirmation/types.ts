type UseDiscardChangesConfirmationOptions = {
    /** Returns whether the screen has unsaved changes. The hook already gates on focus and an in-progress save, so this should report only real dirtiness. */
    getHasUnsavedChanges: () => boolean;
    onCancel?: () => void;
    onVisibilityChange?: (visible: boolean) => void;
    onConfirm?: () => void | Promise<void>;
    onTabSwitchDiscard?: () => void | Promise<void>;

    /**
     * Use on a screen that opens other pages on top of it, such as a confirmation that opens Category. The screen keeps prompting
     * while those pages are open, so closing the RHP from one of them asks first. Going back from them never removes the screen,
     * so it doesn't prompt. Code that closes the flow on purpose from such a page, such as a submit, must call
     * `suppressFlowDiscardPrompt` first.
     */
    shouldPromptWhenUnfocused?: boolean;
};

type DiscardChangesConfirmation = {
    /** Suppress the discard prompt during an intentional navigation (a save, or a redirect such as the billing restriction). Pass `false` to clear it if that navigation aborts without leaving. */
    suppressDiscardPrompt: (shouldSuppress?: boolean) => void;
};

export default UseDiscardChangesConfirmationOptions;
export type {DiscardChangesConfirmation};
