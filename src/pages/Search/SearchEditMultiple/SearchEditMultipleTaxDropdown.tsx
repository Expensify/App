import type {DropdownFieldRenderProps} from '@components/DropdownField';
import TaxPickerModal from '@components/TaxPicker/TaxPickerModal';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import {updateBulkEditDraftTransaction} from '@libs/actions/IOU/BulkEdit';
import type {TaxRatesOption} from '@libs/TaxOptionsListUtils';
import {getWorkspaceTaxesSettingsName} from '@libs/TransactionUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';

import {getBulkEditTaxCodeChange} from './SearchEditMultipleUtils';

type SearchEditMultipleTaxDropdownProps = DropdownFieldRenderProps & {
    /** Workspace the tax rates belong to */
    policyID: string | undefined;

    /** Code of the rate the draft already holds */
    currentTaxCode: string;
};

/**
 * The tax rate list, in the container anchored to the bulk edit form's tax row. Mounted only once the row is opened,
 * and records the pick on the draft the same way the full-page selector does.
 */
function SearchEditMultipleTaxDropdown({policyID, currentTaxCode, onClose, ...popoverProps}: SearchEditMultipleTaxDropdownProps) {
    const {translate} = useLocalize();
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);

    // The list has no expense to read, so it marks the workspace currency's default rate, while the row's name marks the
    // default for the draft's currency. The list finds the picked rate by its name, so it is given the name the list uses,
    // or the rate shows twice when those defaults differ.
    const selectedTaxRate = getWorkspaceTaxesSettingsName(translate, policy, currentTaxCode) ?? '';

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
