type UseDiscardChangesConfirmationOptions = {
    /** Returns whether the screen has unsaved changes. The hook already gates on focus and an in-progress save, so this should report only real dirtiness. */
    getHasUnsavedChanges: () => boolean;
    onCancel?: () => void;
    onVisibilityChange?: (visible: boolean) => void;
    onConfirm?: () => void | Promise<void>;
    onTabSwitchDiscard?: () => void | Promise<void>;

    /**
     * Use on the first screen of a multi-step flow. The screen keeps prompting while the flow's other steps are open on top of it,
     * so closing the RHP from any step asks first. Going back between steps never removes the first screen, so it doesn't prompt.
     * Code that closes the flow on purpose from a later step, such as a submit, must call `suppressFlowDiscardPrompt` first.
     */
    shouldPromptWhenUnfocused?: boolean;
};

type DiscardChangesConfirmation = {
    /** Suppress the discard prompt during an intentional navigation (a save, or a redirect such as the billing restriction). Pass `false` to clear it if that navigation aborts without leaving. */
    suppressDiscardPrompt: (shouldSuppress?: boolean) => void;
};

export default UseDiscardChangesConfirmationOptions;
export type {DiscardChangesConfirmation};
