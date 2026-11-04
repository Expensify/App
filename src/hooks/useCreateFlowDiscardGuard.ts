import {haveMoneyRequestDraftsUserEdits} from '@libs/MoneyRequestUtils';
import cleanupAfterExpenseCreate from '@libs/Navigation/helpers/cleanupAfterExpenseCreate';

import ONYXKEYS from '@src/ONYXKEYS';
import type {OdometerDraft} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {validTransactionDraftsSelector} from '@selectors/TransactionDraft';

import useDiscardChangesConfirmation from './useDiscardChangesConfirmation';
import useOnyx from './useOnyx';

type UseCreateFlowDiscardGuardParams = {
    /** Whether to guard the flow. Only the first screen of a create expense flow should. */
    isEnabled: boolean;

    /** Checked each time the guard runs. Return false to not ask this time, e.g. on a screen that is only sometimes the first one. */
    shouldPrompt?: () => boolean;

    /** Odometer readings the user saved for later. They're kept after the flow closes, so they aren't something to lose. */
    savedOdometerDraft?: OnyxEntry<OdometerDraft>;

    /** Runs after the user picks Discard, before the flow closes */
    onBeforeClose?: () => void | Promise<void>;
};

/**
 * Asks "Discard changes?" when the user closes a create expense flow from any step while a draft has their input. Discard clears
 * the drafts. Use it on the flow's first screen: going back between steps never removes that screen, so it doesn't prompt.
 */
function useCreateFlowDiscardGuard({isEnabled, shouldPrompt, savedOdometerDraft, onBeforeClose}: UseCreateFlowDiscardGuardParams) {
    // Starting a flow clears all drafts, so every draft here belongs to this flow. Multi-scan has one draft per receipt.
    const [drafts] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {selector: validTransactionDraftsSelector});
    const isFlowDirty = isEnabled && haveMoneyRequestDraftsUserEdits(drafts, {savedOdometerDraft});

    useDiscardChangesConfirmation({
        getHasUnsavedChanges: () => isFlowDirty && (shouldPrompt?.() ?? true),
        shouldPromptWhenUnfocused: isEnabled,
        onConfirm: onBeforeClose,
        // Wait for the RHP to finish closing, so its screens don't show empty fields on the way out
        onDiscarded: () => cleanupAfterExpenseCreate({draftTransactionIDs: Object.keys(drafts ?? {}), shouldWaitForUpcomingTransition: true}),
    });

    return {isFlowDirty};
}

export default useCreateFlowDiscardGuard;
