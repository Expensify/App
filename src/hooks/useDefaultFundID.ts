import {useOnyx} from 'react-native-onyx';
import {getFundIdFromSettingsKey} from '@libs/CardUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import useWorkspaceAccountID from './useWorkspaceAccountID';

/**
 * Hook to get the default fundID for a given policyID. This is used to get the settings and cards for each of the feeds.
 * It will always return lastSelectedExpensifyCardFeed if it exists or fallback to the domainFundID or workspaceAccountID.
 */
function useDefaultFundID(policyID: string | undefined) {
    const workspaceAccountID = useWorkspaceAccountID(policyID);
    const [lastSelectedExpensifyCardFeed] = useOnyx(`${ONYXKEYS.COLLECTION.LAST_SELECTED_EXPENSIFY_CARD_FEED}${policyID}`, {canBeMissing: true});

    const [domainFundID] = useOnyx(ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS, {
        selector: (cardSettings) => {
            const matchingKey = Object.entries(cardSettings ?? {}).find(
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                ([key, settings]) => settings?.preferredPolicy && settings.preferredPolicy === policyID && !key.includes(workspaceAccountID.toString()),
            );

            return getFundIdFromSettingsKey(matchingKey?.[0] ?? '');
        },
        canBeMissing: true,
    });

    if (lastSelectedExpensifyCardFeed) {
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
