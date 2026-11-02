import {useConfirmationFields} from '@components/MoneyRequestConfirmationFields/context';
import TaxPickerModal from '@components/TaxPicker/TaxPickerModal';

import useOnyx from '@hooks/useOnyx';
import useUpdateTransactionTaxRate from '@hooks/useUpdateTransactionTaxRate';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';

import type {ExpenseFieldDropdownRenderProps} from './ExpenseFieldDropdown';

type TaxFieldDropdownProps = ExpenseFieldDropdownRenderProps & {
    /** ID of the expense the picked tax rate is written to */
    transactionID: string;

    /** Policy the tax rates belong to */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** The expense's current tax rate, as its row shows it, so the list can mark it */
    selectedTaxRate: string;
};

/**
 * The tax rate list, in the container anchored to the expense form's tax rate row. Mounted only once the row is
 * opened, and saves through the same hook the full-page selector uses so both leave the expense, and its tax amount,
 * in the same state.
 */
function TaxFieldDropdown({transactionID, policy, selectedTaxRate, onClose, ...popoverProps}: TaxFieldDropdownProps) {
    const {reportID, isEditingSplitBill, action, iouType} = useConfirmationFields();

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`);
    const [draftTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`);

    const {updateTaxRate} = useUpdateTransactionTaxRate({
        transactionID,
        transaction: draftTransaction ?? transaction,
        report,
        policy,
        isEditing: action === CONST.IOU.ACTION.EDIT,
        isEditingSplit: isEditingSplitBill,
    });

    return (
        <TaxPickerModal
            {...popoverProps}
            onClose={onClose}
            shouldFitContentHeight
            shouldShowHeader
            policyID={policy?.id}
            transactionID={transactionID}
            selectedTaxRate={selectedTaxRate}
            action={action}
            iouType={iouType}
            onSelected={updateTaxRate}
        />
    );
}

export default TaxFieldDropdown;
