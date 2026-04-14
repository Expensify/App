import {useEffect} from 'react';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import {updatePersonalCardConnection} from '@libs/actions/PersonalCards';
import {getBankName, isCardConnectionBroken} from '@libs/CardUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getPersonalCardBankConnection} from '@userActions/getCompanyCardBankConnection';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {CompanyCardFeed} from '@src/types/onyx';

function useFixPersonalCardConnection(cardID: string) {
    const {isOffline} = useNetwork();

    const [cardList] = useOnyx(ONYXKEYS.CARD_LIST);
    const card = cardList?.[cardID];
    const bankDisplayName = card ? getBankName(card.bank as CompanyCardFeed) : '';
    const url = getPersonalCardBankConnection(bankDisplayName);
    const isCardBroken = card ? isCardConnectionBroken(card) : false;

    useEffect(() => {
        if (isCardBroken) {
            return;
        }
        if (card) {
            updatePersonalCardConnection(card.cardID.toString(), card.lastScrapeResult);
        }
        Navigation.goBack(ROUTES.SETTINGS_WALLET_PERSONAL_CARD_DETAILS.getRoute(cardID));
    }, [isCardBroken, card, cardID]);

    return {card, bankDisplayName, url, isCardBroken, isOffline};
}

export default useFixPersonalCardConnection;
