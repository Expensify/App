import type {NavigationAction} from '@react-navigation/native';

type UseDiscardChangesConfirmationOptions = {
    /** Returns whether the screen has unsaved changes. The hook already gates on focus and an in-progress save, so this should report only real dirtiness. */
    getHasUnsavedChanges: () => boolean;
    onCancel?: () => void;
    onVisibilityChange?: (visible: boolean) => void;
    onConfirm?: () => void | Promise<void>;
    onTabSwitchDiscard?: () => void | Promise<void>;

    /**
     * Guard the root screen of a multi-step flow: keep prompting while later steps are stacked on top of it, as long as the flow is visible.
     * Going back inside the flow never removes the root, so only leaving the flow prompts. Intentional exits from a later step must call `suppressFlowDiscardPrompt`.
     */
    shouldPromptWhenUnfocused?: boolean;

    /** Return `false` to let a navigation action through without prompting. */
    shouldPromptForNavigationAction?: (action: NavigationAction) => boolean;

    /** Runs right before a confirmed discard removes this screen, whether this guard prompted or another guard confirmed the same navigation. */
    onDiscarded?: () => void;
};

type DiscardChangesConfirmation = {
    /** Suppress the discard prompt during an intentional navigation (a save, or a redirect such as the billing restriction). Pass `false` to clear it if that navigation aborts without leaving. */
    suppressDiscardPrompt: (shouldSuppress?: boolean) => void;
};

export default UseDiscardChangesConfirmationOptions;
export type {DiscardChangesConfirmation};
