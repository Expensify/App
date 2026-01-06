import {useCallback} from 'react';
import type {OnyxCollection} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ExpensifyCardSettings} from '@src/types/onyx';
import useOnyx from './useOnyx';
import useWorkspaceAccountID from './useWorkspaceAccountID';

function useExpensifyCardFeeds(policyID: string | undefined) {
    const workspaceAccountID = useWorkspaceAccountID(policyID);

    const getAllExpensifyCardFeeds = useCallback(
        (cardSettings: OnyxCollection<ExpensifyCardSettings>) => {
            const matchingEntries = Object.entries(cardSettings ?? {}).filter(([key, settings]) => {
                const isDomainFeed = !!(settings?.preferredPolicy && settings.preferredPolicy === policyID);
                const isWorkspaceFeed = key.includes(workspaceAccountID.toString()) && settings && Object.keys(settings).length > 1;
                return isDomainFeed || isWorkspaceFeed;
            });

            return Object.fromEntries(matchingEntries);
        },
        [policyID, workspaceAccountID],
    );

    const [allExpensifyCardFeeds] = useOnyx(
        ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS,
        {
            selector: getAllExpensifyCardFeeds,
            canBeMissing: true,
        },
        [getAllExpensifyCardFeeds],
    );

    return allExpensifyCardFeeds;
}

export default useExpensifyCardFeeds;
