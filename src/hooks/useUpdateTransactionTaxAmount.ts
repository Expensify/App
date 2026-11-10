/**
 * Saves the tax amount of a saved expense, from wherever it is edited. Both the tax amount page and the inline input on
 * the expense view save through here, so an edit in either leaves the expense in the same state.
 */
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';

import {updateMoneyRequestTaxAmount} from '@userActions/IOU/UpdateMoneyRequest';

import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import type {MoneyRequestUpdateParams} from './useMoneyRequestUpdateParams';

import useOnyx from './useOnyx';

type UseUpdateTransactionTaxAmountParams = {
    /** ID of the saved expense being written to */
    transactionID: string | undefined;

    /** What the write needs to recompute the expense's violations, read once by the caller */
    updateParams: MoneyRequestUpdateParams;

    /** Policy the tax belongs to. For an unreported expense it is the workspace the expense would move to */
    policy: OnyxEntry<OnyxTypes.Policy>;
};

type UseUpdateTransactionTaxAmountResult = {
    /** Saves `taxAmount`, in the smallest currency unit, to the expense */
    updateTaxAmount: (taxAmount: number) => void;
};

function useUpdateTransactionTaxAmount({transactionID, updateParams, policy}: UseUpdateTransactionTaxAmountParams): UseUpdateTransactionTaxAmountResult {
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${getNonEmptyStringOnyxID(policy?.id)}`);
    const [policyTagList] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${getNonEmptyStringOnyxID(policy?.id)}`);

    const updateTaxAmount = (taxAmount: number) => {
        if (!transactionID) {
            return;
        }
        updateMoneyRequestTaxAmount({...updateParams, transactionID, taxAmount, policy, policyCategories, policyTagList});
    };

    return {updateTaxAmount};
}

export default useUpdateTransactionTaxAmount;
