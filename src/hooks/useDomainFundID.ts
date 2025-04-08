import {useOnyx} from 'react-native-onyx';
import {getWorkspaceAccountID} from '@libs/PolicyUtils';
import ONYXKEYS from '@src/ONYXKEYS';

function useDomainFundID(policyID: string | undefined) {
    const workspaceAccountID = getWorkspaceAccountID(policyID);
    const prefix = ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS;

    const [domainFundIDs] = useOnyx(ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS, {
        selector: (cardSettings) => {
            const matchingKeys = Object.entries(cardSettings ?? {})
                .filter(
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    ([key, settings]) => settings?.preferredPolicy && settings.preferredPolicy === policyID && !key.includes(workspaceAccountID.toString()),
                )
                .map(([key]) => {
                    const accountIDStr = key.substring(prefix.length);

                    if (!key?.startsWith(prefix)) {
                        return undefined;
                    }
                    const accountID = Number(accountIDStr);
                    return Number.isNaN(accountID) ? undefined : accountID;
                });
            return matchingKeys;
        },
    });

    return domainFundIDs;
}

export default useDomainFundID;
