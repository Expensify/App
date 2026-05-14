import {useEffect} from 'react';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import {updatePersonalCardConnection} from '@libs/actions/PersonalCards';
import {getBankName, getPlaidInstitutionId, isCardConnectionBroken} from '@libs/CardUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getPersonalCardBankConnection} from '@userActions/getCompanyCardBankConnection';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {CompanyCardFeed} from '@src/types/onyx';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

function useFixPersonalCardConnection(cardID: string) {
    const {isOffline} = useNetwork();

    const [cardList, cardListMetadata] = useOnyx(ONYXKEYS.CARD_LIST);
    const card = cardList?.[cardID];
    const bankDisplayName = card ? getBankName(card.bank as CompanyCardFeed) : '';
    const isPlaid = !!(card?.bank && getPlaidInstitutionId(card.bank as CompanyCardFeed));
    const url = isPlaid ? null : getPersonalCardBankConnection(bankDisplayName);
    const country = card?.nameValuePairs?.country ?? CONST.COUNTRY.US;
    const isCardBroken = card ? isCardConnectionBroken(card) : false;

    useEffect(() => {
        if (isLoadingOnyxValue(cardListMetadata)) {
            return;
        }
        // The Plaid flow drives its own SyncCard from onSuccess, so skip the auto-sync here
        // to avoid a duplicate call when our optimistic update flips isCardBroken before unmount.
        if (!card || isCardBroken || isPlaid) {
            return;
        }
        updatePersonalCardConnection(card.cardID.toString(), card.lastScrapeResult);
        Navigation.goBack(ROUTES.SETTINGS_WALLET_PERSONAL_CARD_DETAILS.getRoute(cardID));
    }, [isCardBroken, card, cardID, cardListMetadata, isPlaid]);

    return {card, bankDisplayName, url, isCardBroken, isOffline, isPlaid, country};
}

export default useFixPersonalCardConnection;
