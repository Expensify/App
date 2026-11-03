import AnchoredSelectionListPopover from '@components/AnchoredSelectionListPopover';
import type {AnchoredSelectionListPopoverProps} from '@components/AnchoredSelectionListPopover';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import type {TaxRatesOption} from '@libs/TaxOptionsListUtils';
import {getEnabledTaxRateCount} from '@libs/TransactionUtils';

import CONST from '@src/CONST';
import type {IOUAction, IOUType} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';

import React from 'react';

import TaxPicker from '.';

/** The list's name and how many rates it offers: all the pop-over needs from the policy to size and title itself */
const taxRatesSummarySelector = (policy: Policy | undefined) => ({name: policy?.taxRates?.name, enabledCount: getEnabledTaxRateCount(policy?.taxRates?.taxes ?? {})});

type TaxPickerModalProps = {
    /** The policy whose tax rates should be shown */
    policyID: string | undefined;

    /** The expense the rate is picked for, which the list reads the current rate and default off */
    transactionID?: string;

    /** The expense's current tax rate, as its row shows it, so the list can mark it */
    selectedTaxRate?: string;

    /** What is being done to the expense, which decides whether the list reads its draft or the saved expense */
    action?: IOUAction;

    /** Type of the expense, which together with `action` decides whether a split being edited is read */
    iouType?: IOUType;

    /** Called when the user confirms a tax rate. `shouldClearTax` asks to clear the tax instead, for a rate the workspace no longer has */
    onSelected?: (tax: TaxRatesOption, shouldClearTax?: boolean) => void;
} & Omit<AnchoredSelectionListPopoverProps, 'optionCount' | 'isSearchable' | 'title' | 'backButtonSentryLabel' | 'headerActions' | 'children'>;

/**
 * The tax rate list in a container anchored to a row: a pop-over on a wide layout, a bottom sheet on a narrow one.
 * Picking a rate hands it to `onSelected` and closes the container, as the category and tag lists do.
 */
function TaxPickerModal({policyID, transactionID, selectedTaxRate, action, iouType, onSelected, onClose, ...popoverProps}: TaxPickerModalProps) {
    const {translate} = useLocalize();

    const [taxRatesSummary] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {selector: taxRatesSummarySelector});
    const enabledTaxRatesCount = taxRatesSummary?.enabledCount ?? 0;

    const handleTaxRateSelected = (tax: TaxRatesOption, shouldClearTax?: boolean) => {
        onSelected?.(tax, shouldClearTax);
        onClose();
    };

    return (
        <AnchoredSelectionListPopover
            {...popoverProps}
            onClose={onClose}
            // The list shows one row per enabled rate. A rate the expense holds that the workspace since removed adds a row the
            // sheet is not sized for, and the list scrolls that one row.
            optionCount={enabledTaxRatesCount}
            // The list shows its search input from the standard limit, and sizes itself the same way.
            isSearchable={enabledTaxRatesCount >= CONST.STANDARD_LIST_ITEM_LIMIT}
            title={taxRatesSummary?.name ?? translate('iou.taxRate')}
            backButtonSentryLabel={CONST.SENTRY_LABEL.TAX_PICKER_MODAL.BACK_BUTTON}
        >
            <TaxPicker
                policyID={policyID}
                transactionID={transactionID}
                selectedTaxRate={selectedTaxRate}
                action={action}
                iouType={iouType}
                onSubmit={handleTaxRateSelected}
                // Tapping the rate the expense already has leaves it alone, as the full-page selector does, and only closes the list.
                onDismiss={onClose}
                shouldAutoFocusSearchInput
            />
        </AnchoredSelectionListPopover>
    );
}

export default TaxPickerModal;
export type {TaxPickerModalProps};
