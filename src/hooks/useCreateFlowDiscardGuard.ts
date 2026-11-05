import {haveMoneyRequestDraftsUserEdits} from '@libs/MoneyRequestUtils';

import ONYXKEYS from '@src/ONYXKEYS';

import {validTransactionDraftsSelector} from '@selectors/TransactionDraft';

import useDiscardChangesConfirmation from './useDiscardChangesConfirmation';
import useOnyx from './useOnyx';

type UseCreateFlowDiscardGuardParams = {
    /** Whether to guard the flow. Only the confirmation of a create expense flow should. */
    isEnabled: boolean;

    /** Checked each time the guard runs. Return false to not ask this time, e.g. on a tab that doesn't show the confirmation. */
    shouldPrompt?: () => boolean;

    /** Whether going back from the confirmation to an earlier step asks. Turn it off when that step shows the same data and has its own guard. */
    shouldPromptWhenGoingBackInFlow?: boolean;

    /** Runs after the user picks Discard, before the flow closes */
    onBeforeClose?: () => void | Promise<void>;
};

/**
 * Asks "Discard changes?" when the user leaves the confirmation of a create expense flow while a draft has their input. It also
 * asks when the user closes the RHP from a page opened from the confirmation, such as Category. Going back from such a page to
 * the confirmation doesn't remove it, so it doesn't prompt.
 */
function useCreateFlowDiscardGuard({isEnabled, shouldPrompt, shouldPromptWhenGoingBackInFlow, onBeforeClose}: UseCreateFlowDiscardGuardParams) {
    // Starting a flow clears all drafts, so every draft here belongs to this flow. Multi-scan has one draft per receipt.
    const [drafts] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {selector: validTransactionDraftsSelector});
    // Odometer readings saved for later are kept after the flow closes, so they aren't something to lose
    const [savedOdometerDraft] = useOnyx(ONYXKEYS.ODOMETER_DRAFT);
    const isFlowDirty = isEnabled && haveMoneyRequestDraftsUserEdits(drafts, {savedOdometerDraft});

    useDiscardChangesConfirmation({
        getHasUnsavedChanges: () => isFlowDirty && (shouldPrompt?.() ?? true),
        shouldPromptWhenUnfocused: isEnabled,
        shouldPromptWhenGoingBackInFlow,
        onConfirm: onBeforeClose,
    });

    return {isFlowDirty};
}

export default useCreateFlowDiscardGuard;
