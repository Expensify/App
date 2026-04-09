import {useCallback} from 'react';
import type {OnyxCollection} from 'react-native-onyx';
import {
    getCardSettings,
    getFundIdFromSettingsKey,
    getLinkedPolicyIDsFromExpensifyCardSettings,
    getPreferredPolicyFromExpensifyCardSettings,
    isPolicyIDInLinkedExpensifyCardPolicyList,
} from '@libs/CardUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ExpensifyCardSettings} from '@src/types/onyx';
import useOnyx from './useOnyx';
import useWorkspaceAccountID from './useWorkspaceAccountID';

/**
 * Hook to get the default fundID for a given policyID. This is used to get the settings and cards for each of the feeds.
 * It will always return lastSelectedExpensifyCardFeed if it exists or fallback to the domainFundID or workspaceAccountID.
 */
function useDefaultFundID(policyID: string | undefined) {
    const workspaceAccountID = useWorkspaceAccountID(policyID);
    const [lastSelectedExpensifyCardFeed] = useOnyx(`${ONYXKEYS.COLLECTION.LAST_SELECTED_EXPENSIFY_CARD_FEED}${policyID}`);
    const [lastSelectedCardSettings] = useOnyx(`${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${lastSelectedExpensifyCardFeed}`);
    const lastSelectedSettings = getCardSettings(lastSelectedCardSettings);

    const getDomainFundID = useCallback(
        (cardSettings: OnyxCollection<ExpensifyCardSettings>) => {
            const eligibleEntries = Object.entries(cardSettings ?? {}).filter(([key, settings]) => !!settings && !key.includes(workspaceAccountID.toString()));

            if (policyID) {
                const preferredMatch = eligibleEntries.find(([, settings]) => getPreferredPolicyFromExpensifyCardSettings(settings)?.toUpperCase() === policyID.toUpperCase());
                if (preferredMatch) {
                    return getFundIdFromSettingsKey(preferredMatch[0]);
                }

                const linkedMatch = eligibleEntries.find(([, settings]) => isPolicyIDInLinkedExpensifyCardPolicyList(getLinkedPolicyIDsFromExpensifyCardSettings(settings), policyID));
                if (linkedMatch) {
                    return getFundIdFromSettingsKey(linkedMatch[0]);
                }
            }

            return getFundIdFromSettingsKey('');
        },
        [policyID, workspaceAccountID],
    );

    const [domainFundID] = useOnyx(
        ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS,
        {
            selector: getDomainFundID,
        },
        [getDomainFundID],
    );

    if (lastSelectedExpensifyCardFeed && lastSelectedSettings?.paymentBankAccountID) {
        return lastSelectedExpensifyCardFeed;
    }

    if (domainFundID) {
        return domainFundID;
    }

    if (workspaceAccountID) {
        return workspaceAccountID;
    }

    return CONST.DEFAULT_NUMBER_ID;
}

export default useDefaultFundID;
