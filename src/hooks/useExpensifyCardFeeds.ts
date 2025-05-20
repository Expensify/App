import {useOnyx} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import useWorkspaceAccountID from './useWorkspaceAccountID';

function useExpensifyCardFeeds(policyID: string | undefined) {
    const workspaceAccountID = useWorkspaceAccountID(policyID);
    const [allExpensifyCardFeeds] = useOnyx(ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS, {
        selector: (cardSettings) => {
            const matchingEntries = Object.entries(cardSettings ?? {}).filter(([key, settings]) => {
                const isDomainFeed = !!(settings?.preferredPolicy && settings.preferredPolicy === policyID);
                const isWorkspaceFeed = key.includes(workspaceAccountID.toString()) && settings && Object.keys(settings).length > 1;
                return isDomainFeed || isWorkspaceFeed;
            });

            return Object.fromEntries(matchingEntries);
        },
        canBeMissing: true,
    });

    return allExpensifyCardFeeds;
}

export default useExpensifyCardFeeds;
