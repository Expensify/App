import type {DropdownFieldRenderProps} from '@components/DropdownField';
import TaxPickerModal from '@components/TaxPicker/TaxPickerModal';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import {updateBulkEditDraftTransaction} from '@libs/actions/IOU/BulkEdit';
import {resolveCurrentTaxCode} from '@libs/PolicyUtils';
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

    const resolvedTaxCode = resolveCurrentTaxCode(policy, currentTaxCode);
    const selectedTaxRate = getWorkspaceTaxesSettingsName(translate, policy, resolvedTaxCode) ?? '';

    const saveTaxRate = (taxes: TaxRatesOption) => {
        updateBulkEditDraftTransaction(getBulkEditTaxCodeChange(taxes.code ?? '', resolvedTaxCode));
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
