/**
 * Saves the description of a saved expense, from wherever it is edited. Both the description page and the inline input
 * on the expense view save through here, so an edit in either leaves the expense in the same state.
 */
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';

import {updateMoneyRequestDescription} from '@userActions/IOU/UpdateMoneyRequest';

import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import type {MoneyRequestUpdateParams} from './useMoneyRequestUpdateParams';

import useOnyx from './useOnyx';

type UseUpdateTransactionDescriptionParams = {
    /** Saved expense being written to */
    transaction: OnyxEntry<OnyxTypes.Transaction>;

    /** What the write needs to recompute the expense's violations, read once by the caller */
    updateParams: MoneyRequestUpdateParams;
};

type UseUpdateTransactionDescriptionResult = {
    /** Saves `description`, written as markdown, to the expense */
    updateDescription: (description: string) => void;
};

function useUpdateTransactionDescription({transaction, updateParams}: UseUpdateTransactionDescriptionParams): UseUpdateTransactionDescriptionResult {
    const transactionID = transaction?.transactionID;
    const [policyVendors] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_VENDORS}${getNonEmptyStringOnyxID(updateParams.transactionThreadReport?.policyID)}`);

    const updateDescription = (description: string) => {
        if (!transactionID) {
            return;
        }
        updateMoneyRequestDescription({...updateParams, transactionID, transaction, comment: description, policyVendors});
    };

    return {updateDescription};
}

export default useUpdateTransactionDescription;
