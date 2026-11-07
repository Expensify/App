import {getDistanceRateCustomUnitRate} from '@libs/PolicyUtils';
import {getDisplayTransactionWithoutInvalidCommuterExclusion, isDistanceRequest} from '@libs/TransactionUtils';

import type {Policy, Transaction} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {useCurrencyListActions} from './useCurrencyList';
import useDistanceRateOriginalPolicy from './useDistanceRateOriginalPolicy';
import useLocalize from './useLocalize';

type UseDisplayTransactionResult = {
    displayTransaction: OnyxEntry<Transaction>;
    distanceOriginalPolicy: OnyxEntry<Policy>;
};

/**
 * Normalizes a transaction for display, keeping commuter-reduced values in policy
 * expense chats and restoring full-route values elsewhere when possible.
 *
 * @param policy Fallback policy used for display normalization when no original policy is found.
 * @param rateLookupPolicy Policy checked for the selected rate before searching other policies. Defaults to policy.
 */
function useDisplayTransaction(
    transaction: OnyxEntry<Transaction>,
    isPolicyExpenseChat: boolean,
    policy?: OnyxEntry<Policy>,
    rateLookupPolicy: OnyxEntry<Policy> = policy,
): UseDisplayTransactionResult {
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
