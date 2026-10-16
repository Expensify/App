import {useConfirmationFields} from '@components/MoneyRequestConfirmationFields/context';
import AddReceiptButton from '@components/MoneyRequestConfirmationList/sections/AddReceiptButton';
import type {ExpenseFormLayoutContextValue} from '@components/MoneyRequestConfirmationList/sections/ExpenseFormLayoutContext';
import type {ReceiptOptions} from '@components/MoneyRequestConfirmationListFooter/fieldGroupTypes';

import {shouldShowReceiptEmptyState} from '@libs/IOUUtils';

import type * as OnyxTypes from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';

/**
 * The layout a confirmation form that offers the compact add-receipt button provides to its fields, and the flag
 * the footer needs to space its receipt area.
 *
 * `hasReceipt` is a close approximation of what `ReceiptSection` resolves for itself rather than the same
 * decision: it reads the raw receipt path where the section reads the thumbnail it resolves from the transaction,
 * and it does not know about the distance-map case that hides the receipt area outright. The footers that hide the
 * receipt behind a map do not use this hook.
 */
function useAddReceiptLayout(policy: OnyxEntry<OnyxTypes.Policy>, receiptOptions: ReceiptOptions): {expenseFormLayout: ExpenseFormLayoutContextValue; hasReceipt: boolean} {
    const {action, iouType, isPerDiemRequest, isReadOnly} = useConfirmationFields();

    const hasReceipt = (!!receiptOptions.receiptPath && !!receiptOptions.receiptFilename) || !!receiptOptions.isLoadingReceipt;
    const canAddReceipt = !isReadOnly && shouldShowReceiptEmptyState(iouType, action, policy, isPerDiemRequest);

    return {
        expenseFormLayout: {shouldUseDropdownRows: true, amountTrailingAction: !hasReceipt && canAddReceipt ? <AddReceiptButton /> : undefined},
        hasReceipt,
    };
}

export default useAddReceiptLayout;
