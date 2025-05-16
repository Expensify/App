import {useOnyx} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import useWorkspaceAccountID from './useWorkspaceAccountID';

function useExpensifyCardFeeds(policyID: string | undefined) {
    const workspaceAccountID = useWorkspaceAccountID(policyID);
    const [allExpensifyCardFeeds] = useOnyx(ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS, {
        selector: (cardSettings) => {
            const matchingEntries = Object.entries(cardSettings ?? {}).filter(
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                ([key, settings]) => !!(settings?.preferredPolicy && settings.preferredPolicy === policyID) || (key.includes(workspaceAccountID.toString()) && settings?.domainName),
            );

            return Object.fromEntries(matchingEntries);
        },
        canBeMissing: true,
    });

    return allExpensifyCardFeeds;
}

export default useExpensifyCardFeeds;
