import {haveMoneyRequestDraftsUserEdits} from '@libs/MoneyRequestUtils';
import cleanupAfterExpenseCreate from '@libs/Navigation/helpers/cleanupAfterExpenseCreate';

import ONYXKEYS from '@src/ONYXKEYS';
import type {OdometerDraft} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {validTransactionDraftsSelector} from '@selectors/TransactionDraft';

import useDiscardChangesConfirmation from './useDiscardChangesConfirmation';
import useOnyx from './useOnyx';

type UseCreateFlowDiscardGuardParams = {
    /** Whether the screen is the root of a create-expense flow, the first screen the user lands on */
    isEnabled: boolean;

    /** Checked when the guard runs, for a screen that is the root of the flow only when nothing was opened below it */
    getIsFlowRoot?: () => boolean;

    /** Odometer readings saved for later, which persist on their own and aren't lost when the flow closes */
    savedOdometerDraft?: OnyxEntry<OdometerDraft>;

    /** Side effects that must only run once the user confirms leaving, right before the flow closes */
    onBeforeClose?: () => void | Promise<void>;
};

/**
 * Guards the root screen of a create-expense flow. Leaving the flow from any of its steps prompts "Discard changes?" while a draft holds
 * user input, and Discard clears the drafts once the flow has closed. Going back inside the flow never removes the root, so it never prompts.
 */
function useCreateFlowDiscardGuard({isEnabled, getIsFlowRoot, savedOdometerDraft, onBeforeClose}: UseCreateFlowDiscardGuardParams) {
    // A new flow clears every draft when it starts, so the whole collection belongs to this flow (multi-scan keeps one draft per receipt)
    const [drafts] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {selector: validTransactionDraftsSelector});
    const isFlowDirty = isEnabled && haveMoneyRequestDraftsUserEdits(drafts, {savedOdometerDraft});

    useDiscardChangesConfirmation({
        getHasUnsavedChanges: () => isFlowDirty && (getIsFlowRoot?.() ?? true),
        shouldPromptWhenUnfocused: isEnabled,
        onConfirm: onBeforeClose,
        // Wait for the closing transition so the flow's screens don't flash empty on their way out
        onDiscarded: () => cleanupAfterExpenseCreate({draftTransactionIDs: Object.keys(drafts ?? {}), shouldWaitForUpcomingTransition: true}),
    });

    return {isFlowDirty};
}

export default useCreateFlowDiscardGuard;
