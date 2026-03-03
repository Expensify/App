import {useCallback} from 'react';
import {addPersonalPlaidCard} from '@userActions/Plaid';
import ONYXKEYS from '@src/ONYXKEYS';
import useOnyx from './useOnyx';

export default function useImportPersonalPlaidAccounts() {
    const [addNewCard] = useOnyx(ONYXKEYS.ADD_NEW_PERSONAL_CARD);

    const plaidToken = addNewCard?.data?.publicToken;
    const plaidFeed = addNewCard?.data?.plaidConnectedFeed;
    const plaidAccounts = addNewCard?.data?.plaidAccounts;
    const country = addNewCard?.data?.selectedCountry;

    return useCallback(() => {
        if (!plaidToken || !plaidFeed || !country || !plaidAccounts?.length) {
            return;
        }
        addPersonalPlaidCard(plaidToken, plaidFeed, country, JSON.stringify(plaidAccounts));
    }, [country, plaidAccounts, plaidFeed, plaidToken]);
}
