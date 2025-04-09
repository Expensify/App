import {useOnyx} from 'react-native-onyx';
import useWorkspaceAccountID from '@hooks/useWorkspaceAccountID';
import {getFundIdFromSettingsKey} from '@libs/CardUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

function useDefaultFundID(policyID: string | undefined) {
    const workspaceAccountID = useWorkspaceAccountID(policyID);
    const [lastSelectedExpensifyFeed] = useOnyx(`${ONYXKEYS.COLLECTION.LAST_SELECTED_EXPENSIFY_FEED}${policyID}`);

    const [domainFundID] = useOnyx(ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS, {
        selector: (cardSettings) => {
            const matchingKey = Object.entries(cardSettings ?? {}).find(
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                ([key, settings]) => settings?.preferredPolicy && settings.preferredPolicy === policyID && !key.includes(workspaceAccountID.toString()),
            );

            return getFundIdFromSettingsKey(matchingKey?.[0] ?? '');
        },
    });

    if (lastSelectedExpensifyFeed) {
        return lastSelectedExpensifyFeed;
    }

    if (workspaceAccountID) {
        return workspaceAccountID;
    }

    return domainFundID ?? CONST.DEFAULT_NUMBER_ID;
}

export default useDefaultFundID;
