import {useCallback} from 'react';
import {getDomainNameForPolicy} from '@libs/PolicyUtils';
import {importPlaidAccounts} from '@userActions/Plaid';
import ONYXKEYS from '@src/ONYXKEYS';
import useOnyx from './useOnyx';

export default function useImportPlaidAccounts(policyID?: string) {
    const [assignCard] = useOnyx(ONYXKEYS.ASSIGN_CARD, {canBeMissing: true});
    const [addNewCard] = useOnyx(ONYXKEYS.ADD_NEW_COMPANY_CARD, {canBeMissing: true});

    const plaidToken = addNewCard?.data?.publicToken ?? assignCard?.cardToAssign?.plaidAccessToken;
    const plaidFeed = addNewCard?.data?.plaidConnectedFeed ?? assignCard?.cardToAssign?.institutionId;
    const plaidFeedName = addNewCard?.data?.plaidConnectedFeedName ?? assignCard?.cardToAssign?.plaidConnectedFeedName;
    const plaidAccounts = addNewCard?.data?.plaidAccounts ?? assignCard?.cardToAssign?.plaidAccounts;
    const country = addNewCard?.data?.selectedCountry;
    const statementPeriodEnd = addNewCard?.data?.statementPeriodEnd;
    const statementPeriodEndDay = addNewCard?.data?.statementPeriodEndDay;

    return useCallback(() => {
        if (!policyID || !plaidToken || !plaidFeed || !plaidFeedName || !country || !plaidAccounts?.length) {
            return;
        }
        importPlaidAccounts(plaidToken, plaidFeed, plaidFeedName, country, getDomainNameForPolicy(policyID), JSON.stringify(plaidAccounts), statementPeriodEnd, statementPeriodEndDay, '');
    }, [statementPeriodEnd, statementPeriodEndDay, country, plaidAccounts, plaidFeed, plaidFeedName, plaidToken, policyID]);
}
