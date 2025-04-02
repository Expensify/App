import {useOnyx} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import CONST from '@src/CONST';

function useDomainCardsID(policyID: string | undefined) {
    const [domainCardsSettings] = useOnyx(ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS, {
        selector: (cardSettings) => Object.values(cardSettings ?? {}).find((settings) => settings?.preferredPolicy && settings.preferredPolicy === policyID),
    });

    const domainCardsID = domainCardsSettings?.marqetaBusinessToken ?? CONST.DEFAULT_NUMBER_ID;

    return domainCardsID;
}

export default useDomainCardsID;
