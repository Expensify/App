import {useOnyx} from 'react-native-onyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

function useDomainFundID(policyID: string | undefined) {
    const [domainFundID] = useOnyx(ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS, {
        selector: (cardSettings) => {
            const matchingEntry = Object.entries(cardSettings ?? {}).find(
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                ([_, settings]) => settings?.preferredPolicy && settings.preferredPolicy === policyID,
            );

            if (!matchingEntry) {
                return CONST.DEFAULT_NUMBER_ID;
            }

            const key = matchingEntry[0];
            const prefix = ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS;

            if (!key.startsWith(prefix)) {
                return CONST.DEFAULT_NUMBER_ID;
            }

            const accountIDStr = key.substring(prefix.length);

            const accountID = Number(accountIDStr);
            return Number.isNaN(accountID) ? CONST.DEFAULT_NUMBER_ID : accountID;
        },
    });

    return domainFundID;
}

export default useDomainFundID;
