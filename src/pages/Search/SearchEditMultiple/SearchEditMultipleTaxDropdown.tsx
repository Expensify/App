import type {ExpenseFieldDropdownRenderProps} from '@components/MoneyRequestConfirmationList/sections/ExpenseFieldDropdown';
import TaxPickerModal from '@components/TaxPicker/TaxPickerModal';

import {updateBulkEditDraftTransaction} from '@libs/actions/IOU/BulkEdit';
import type {TaxRatesOption} from '@libs/TaxOptionsListUtils';

import CONST from '@src/CONST';

import React from 'react';

import {getBulkEditTaxCodeChange} from './SearchEditMultipleUtils';

type SearchEditMultipleTaxDropdownProps = ExpenseFieldDropdownRenderProps & {
    /** Workspace the tax rates belong to */
    policyID: string | undefined;

    /** Code of the rate the draft already holds */
    currentTaxCode: string;

    /** The draft's rate as its row shows it, so the list can mark it */
    selectedTaxRate: string;
};

/**
 * The tax rate list, in the container anchored to the bulk edit form's tax row. Mounted only once the row is opened,
 * and records the pick on the draft the same way the full-page selector does.
 */
function SearchEditMultipleTaxDropdown({policyID, currentTaxCode, selectedTaxRate, onClose, ...popoverProps}: SearchEditMultipleTaxDropdownProps) {
    const saveTaxRate = (taxes: TaxRatesOption) => {
        updateBulkEditDraftTransaction(getBulkEditTaxCodeChange(taxes.code ?? '', currentTaxCode));
    };

    return (
        <TaxPickerModal
            {...popoverProps}
            onClose={onClose}
            shouldFitContentHeight
            shouldShowHeader
            policyID={policyID}
            selectedTaxRate={selectedTaxRate}
            action={CONST.IOU.ACTION.EDIT}
            iouType={CONST.IOU.TYPE.SUBMIT}
            // Tapping the picked rate again drops the pending change, as it does on the full page.
            allowDeselect
            onSelected={saveTaxRate}
        />
    );
}

export default SearchEditMultipleTaxDropdown;
