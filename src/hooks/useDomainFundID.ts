import {useOnyx} from 'react-native-onyx';
import {getFundIdFromSettingsKey} from '@libs/CardUtils';
import {getWorkspaceAccountID} from '@libs/PolicyUtils';
import ONYXKEYS from '@src/ONYXKEYS';

function useDomainFundID(policyID: string | undefined) {
    const workspaceAccountID = getWorkspaceAccountID(policyID);

    const [domainFundIDs] = useOnyx(ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS, {
        selector: (cardSettings) => {
            const matchingKeys = Object.entries(cardSettings ?? {})
                .filter(
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    ([key, settings]) => settings?.preferredPolicy && settings.preferredPolicy === policyID && !key.includes(workspaceAccountID.toString()),
                )
                .map(([key]) => getFundIdFromSettingsKey(key));

            return matchingKeys;
        },
    });

    return domainFundIDs;
}

export default useDomainFundID;
