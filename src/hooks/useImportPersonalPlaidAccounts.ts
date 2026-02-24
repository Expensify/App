import {useCallback} from 'react';
import {importPersonalPlaidAccounts} from '@userActions/Plaid';
import ONYXKEYS from '@src/ONYXKEYS';
import useOnyx from './useOnyx';

export default function useImportPersonalPlaidAccounts() {
    const [assignCard] = useOnyx(ONYXKEYS.ASSIGN_CARD);
    const [addNewCard] = useOnyx(ONYXKEYS.ADD_NEW_COMPANY_CARD);

    const plaidToken = addNewCard?.data?.publicToken ?? assignCard?.cardToAssign?.plaidAccessToken;
    const plaidFeed = addNewCard?.data?.plaidConnectedFeed ?? assignCard?.cardToAssign?.institutionId;
    const plaidFeedName = addNewCard?.data?.plaidConnectedFeedName ?? assignCard?.cardToAssign?.plaidConnectedFeedName;
    const plaidAccounts = addNewCard?.data?.plaidAccounts ?? assignCard?.cardToAssign?.plaidAccounts;
    const country = addNewCard?.data?.selectedCountry;

    return useCallback(() => {
        if (!plaidToken || !plaidFeed || !plaidFeedName || !country || !plaidAccounts?.length) {
            return;
        }
        importPersonalPlaidAccounts(plaidToken, plaidFeed, plaidFeedName, country, JSON.stringify(plaidAccounts), '');
    }, [country, plaidAccounts, plaidFeed, plaidFeedName, plaidToken]);
}
