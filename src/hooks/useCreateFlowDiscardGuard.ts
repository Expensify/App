/**
 * Asks "Discard changes?" when the user closes a create expense flow from any step while a draft has their input. Use it on the
 * flow's first screen: going back between steps never removes that screen, so it doesn't prompt.
 */
import {haveMoneyRequestDraftsUserEdits} from '@libs/MoneyRequestUtils';

import ONYXKEYS from '@src/ONYXKEYS';

import useDiscardChangesConfirmation from './useDiscardChangesConfirmation';
import useOnyx from './useOnyx';

type UseCreateFlowDiscardGuardParams = {
    /** Whether to guard the flow. Only the first screen of a create expense flow should. */
    isEnabled: boolean;

    /** Checked each time the guard runs. Return false to not ask this time, e.g. on a screen that is only sometimes the first one. */
    shouldPrompt?: () => boolean;

    /** Runs after the user picks Discard, before the flow closes */
    onBeforeClose?: () => void | Promise<void>;
};

function useCreateFlowDiscardGuard({isEnabled, shouldPrompt, onBeforeClose}: UseCreateFlowDiscardGuardParams) {
    // Odometer readings saved for later are kept after the flow closes, so they aren't something to lose
    const [savedOdometerDraft] = useOnyx(ONYXKEYS.ODOMETER_DRAFT);
    // Starting a flow clears all drafts, so every draft here belongs to this flow. Multi-scan has one draft per receipt.
    const [haveDraftsUserEdits] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {
        selector: (drafts) => haveMoneyRequestDraftsUserEdits(drafts, {savedOdometerDraft}),
    });
    const isFlowDirty = isEnabled && !!haveDraftsUserEdits;

    useDiscardChangesConfirmation({
        getHasUnsavedChanges: () => isFlowDirty && (shouldPrompt?.() ?? true),
        shouldPromptWhenUnfocused: isEnabled,
        onConfirm: onBeforeClose,
    });

    return {isFlowDirty};
}

export default useCreateFlowDiscardGuard;
