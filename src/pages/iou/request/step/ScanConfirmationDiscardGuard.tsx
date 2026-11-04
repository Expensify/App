import useDiscardChangesConfirmation from '@hooks/useDiscardChangesConfirmation';
import useOnyx from '@hooks/useOnyx';

import {haveMoneyRequestDraftsUserEdits} from '@libs/MoneyRequestUtils';
import {isFlowDiscardPromptSuppressed} from '@libs/Navigation/helpers/discardPromptState';

import ONYXKEYS from '@src/ONYXKEYS';

import {useNavigation, useRoute} from '@react-navigation/native';
import {validTransactionDraftsSelector} from '@selectors/TransactionDraft';

/**
 * Asks "Discard changes?" when the user leaves a scan's Confirmation, including going back to the previous step.
 * The Scan step only shows the camera, not the draft, so it doesn't ask itself. Discard goes back and keeps the draft as it is.
 */
function ScanConfirmationDiscardGuard() {
    const navigation = useNavigation();
    const route = useRoute();
    const [drafts] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {selector: validTransactionDraftsSelector});
    const hasUserEdits = haveMoneyRequestDraftsUserEdits(drafts);

    useDiscardChangesConfirmation({
        getHasUnsavedChanges: () => {
            // A submit closes the flow on purpose and mutes the prompt first
            if (!hasUserEdits || isFlowDiscardPromptSuppressed()) {
                return false;
            }

            // When Confirmation is the first screen (a dropped receipt), the flow's own guard on this screen asks instead.
            // Two prompts on one screen would both show.
            return navigation.getState()?.routes.at(0)?.key !== route.key;
        },
    });

    return null;
}

export default ScanConfirmationDiscardGuard;
