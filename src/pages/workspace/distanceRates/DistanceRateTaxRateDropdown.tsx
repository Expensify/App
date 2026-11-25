/**
 * The tax rate field in the Tax section of Add rate. Its list opens anchored to the row, the same way the euro country field does.
 */
import AnchoredSelectionListPopover from '@components/AnchoredSelectionListPopover';
import ExpenseFieldDropdown from '@components/MoneyRequestConfirmationList/sections/ExpenseFieldDropdown';
import type {ValuePickerItem} from '@components/ValuePicker/types';
import ValueSelectionList from '@components/ValuePicker/ValueSelectionList';

import CONST from '@src/CONST';

import noop from 'lodash/noop';
import React from 'react';

type DistanceRateTaxRateDropdownProps = {
    label: string;

    /** Undefined when nothing is selected, which happens when an integration has no 20% rate */
    selectedTaxRateCode: string | undefined;

    taxRates: ValuePickerItem[];

    onSelectTaxRate: (taxRateCode: string) => void;
};

function DistanceRateTaxRateDropdown({label, selectedTaxRateCode, taxRates, onSelectTaxRate}: DistanceRateTaxRateDropdownProps) {
    const selectedItem = taxRates.find((taxRate) => taxRate.value === selectedTaxRateCode);

    return (
        <ExpenseFieldDropdown
            name={label}
            value={selectedItem?.label}
            shouldOpenInDropdown
            // The list always opens in place, so there is no full-page selector to fall back to
            onPress={noop}
            renderDropdown={({onClose, ...popoverProps}) => (
                <AnchoredSelectionListPopover
                    {...popoverProps}
                    onClose={onClose}
                    shouldFitContentHeight
                    optionCount={taxRates.length}
                    isSearchable={taxRates.length >= CONST.STANDARD_LIST_ITEM_LIMIT}
                    title={label}
                    backButtonSentryLabel={CONST.SENTRY_LABEL.CREATE_DISTANCE_RATE.TAX_RATE_BACK_BUTTON}
                >
                    <ValueSelectionList
                        items={taxRates}
                        selectedItem={selectedItem}
                        isVisible={popoverProps.isVisible}
                        onItemSelected={(item) => {
                            onSelectTaxRate(item.value ?? '');
                            onClose();
                        }}
                    />
                </AnchoredSelectionListPopover>
            )}
            sentryLabel={CONST.SENTRY_LABEL.CREATE_DISTANCE_RATE.TAX_RATE_FIELD}
        />
    );
}

export default DistanceRateTaxRateDropdown;
