import type {ExpenseFieldDropdownRenderProps} from '@components/MoneyRequestConfirmationList/sections/ExpenseFieldDropdown';
import TaxPickerModal from '@components/TaxPicker/TaxPickerModal';

import useUpdateTransactionTaxRate from '@hooks/useUpdateTransactionTaxRate';

import CONST from '@src/CONST';
import type {IOUType} from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';

type TaxFieldDropdownProps = ExpenseFieldDropdownRenderProps & {
    /** ID of the expense the picked value is written to */
    transactionID: string;

    /** Expense the picked tax rate is written to */
    transaction: OnyxEntry<OnyxTypes.Transaction>;

    /** Transaction thread report of the expense */
    transactionThreadReport: OnyxEntry<OnyxTypes.Report>;

    /** Policy the tax rates belong to */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** The expense's current tax rate, as its row shows it, so the list can mark it */
    selectedTaxRate: string;

    iouType: IOUType;
};

/**
 * The tax rate list, anchored to the tax rate row of a saved expense. Mounted only once the row is opened, and saves
 * through the same hook the full-page selector uses, so the tax amount is recomputed the same way.
 */
function TaxFieldDropdown({transactionID, transaction, transactionThreadReport, policy, selectedTaxRate, iouType, onClose, ...popoverProps}: TaxFieldDropdownProps) {
    const {updateTaxRate} = useUpdateTransactionTaxRate({
        transactionID,
        transaction,
        report: transactionThreadReport,
        policy,
        isEditing: true,
        isEditingSplit: false,
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
            action={CONST.IOU.ACTION.EDIT}
            iouType={iouType}
            onSelected={updateTaxRate}
        />
    );
}

export default TaxFieldDropdown;
