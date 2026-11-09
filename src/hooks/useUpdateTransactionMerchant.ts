/**
 * Saves the merchant of a saved expense, from wherever it is edited. Both the merchant page and the inline input on the
 * expense view save through here, so an edit in either leaves the expense in the same state.
 */
import {updateMoneyRequestMerchant} from '@userActions/IOU/UpdateMoneyRequest';

import CONST from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import useMoneyRequestUpdateParams from './useMoneyRequestUpdateParams';
import useNetwork from './useNetwork';

type UseUpdateTransactionMerchantParams = {
    /** ID of the saved expense being written to */
    transactionID: string | undefined;

    transactionThreadReport: OnyxEntry<OnyxTypes.Report>;
};

type UseUpdateTransactionMerchantResult = {
    /** Saves `merchant` to the expense. An empty merchant is saved as the partial-merchant placeholder */
    updateMerchant: (merchant: string) => void;
};

function useUpdateTransactionMerchant({transactionID, transactionThreadReport}: UseUpdateTransactionMerchantParams): UseUpdateTransactionMerchantResult {
    const updateParams = useMoneyRequestUpdateParams(transactionID, transactionThreadReport);
    const {isOffline} = useNetwork();

    const updateMerchant = (merchant: string) => {
        if (!transactionID) {
            return;
        }
        updateMoneyRequestMerchant({...updateParams, transactionID, value: merchant || CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT, isOffline});
    };

    return {updateMerchant};
}

export default useUpdateTransactionMerchant;
