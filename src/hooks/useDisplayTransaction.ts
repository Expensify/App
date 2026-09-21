import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useLocalize from '@hooks/useLocalize';

import {getDistanceRateCustomUnitRate} from '@libs/PolicyUtils';
import {getDisplayTransactionWithoutInvalidCommuterExclusion, isDistanceRequest} from '@libs/TransactionUtils';

import type {Policy, Transaction} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import useDistanceRateOriginalPolicy from './useDistanceRateOriginalPolicy';

function useDisplayTransaction(transaction: OnyxEntry<Transaction>, isPolicyExpenseChat: boolean, policy?: OnyxEntry<Policy>, rateLookupPolicy: OnyxEntry<Policy> = policy) {
    const {translate} = useLocalize();
    const {getCurrencySymbol} = useCurrencyListActions();
    const customUnitRateID = isDistanceRequest(transaction) ? transaction?.comment?.customUnit?.customUnitRateID : undefined;
    const shouldLookupDistancePolicy = !!customUnitRateID && !getDistanceRateCustomUnitRate(rateLookupPolicy, customUnitRateID);
    const distanceOriginalPolicy = useDistanceRateOriginalPolicy(customUnitRateID, shouldLookupDistancePolicy);
    const displayTransaction = getDisplayTransactionWithoutInvalidCommuterExclusion({
        transaction,
        isPolicyExpenseChat,
        policy: distanceOriginalPolicy ?? policy,
        translate,
        getCurrencySymbol,
    });

    return {displayTransaction, distanceOriginalPolicy};
}

export default useDisplayTransaction;
