/**
 * Saves the tax amount of a saved expense, from wherever it is edited. Both the tax amount page and the inline input on
 * the expense view save through here, so an edit in either leaves the expense in the same state.
 */
import {updateMoneyRequestTaxAmount} from '@userActions/IOU/UpdateMoneyRequest';

import type * as OnyxTypes from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import type {MoneyRequestUpdateParams} from './useMoneyRequestUpdateParams';

type UseUpdateTransactionTaxAmountParams = {
    /** ID of the saved expense being written to */
    transactionID: string | undefined;

    /** The expense as it is stored, which the write builds its report action from and restores if the save fails */
    transaction: OnyxEntry<OnyxTypes.Transaction>;

    /** What the write needs to recompute the expense's violations, read once by the caller */
    updateParams: MoneyRequestUpdateParams;

    /** Policy the tax belongs to. For an unreported expense it is the workspace the expense would move to */
    policy: OnyxEntry<OnyxTypes.Policy>;
};

type UseUpdateTransactionTaxAmountResult = {
    /** Saves `taxAmount`, in the smallest currency unit, to the expense */
    updateTaxAmount: (taxAmount: number) => Promise<void>;
};

function useUpdateTransactionTaxAmount({
    transactionID,
    transaction,
    updateParams: {readSaveOnlyParams, ...updateParams},
    policy,
}: UseUpdateTransactionTaxAmountParams): UseUpdateTransactionTaxAmountResult {
    const updateTaxAmount = async (taxAmount: number) => {
        if (!transactionID) {
            return;
        }
        // The tax belongs to the expense's own policy, which for an unreported expense isn't the report's
        const saveOnlyParams = await readSaveOnlyParams(policy?.id);
        updateMoneyRequestTaxAmount({...updateParams, ...saveOnlyParams, transactionID, transaction, taxAmount, policy});
    };

    return {updateTaxAmount};
}

export default useUpdateTransactionTaxAmount;
