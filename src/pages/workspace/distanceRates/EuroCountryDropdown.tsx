/**
 * The euro country field on Add rate. Its list opens anchored to the row, the same way the expense form's category field does.
 */
import AnchoredSelectionListPopover from '@components/AnchoredSelectionListPopover';
import ExpenseFieldDropdown from '@components/MoneyRequestConfirmationList/sections/ExpenseFieldDropdown';
import type {ValuePickerItem} from '@components/ValuePicker/types';
import ValueSelectionList from '@components/ValuePicker/ValueSelectionList';

import CONST from '@src/CONST';

import noop from 'lodash/noop';
import React from 'react';

type EuroCountryDropdownProps = {
    label: string;

    /** Country code of the selected country */
    selectedCountry: string;

    countries: ValuePickerItem[];

    onSelectCountry: (country: string) => void;
};

function EuroCountryDropdown({label, selectedCountry, countries, onSelectCountry}: EuroCountryDropdownProps) {
    const selectedItem = countries.find((country) => country.value === selectedCountry);

    return (
        <ExpenseFieldDropdown
            name={label}
            value={selectedItem?.label}
            shouldOpenInDropdown
            // The field sits at the top of the page, so there is always room below it and no full-page selector to fall back to
            onPress={noop}
            renderDropdown={({onClose, ...popoverProps}) => (
                <AnchoredSelectionListPopover
                    {...popoverProps}
                    onClose={onClose}
                    shouldFitContentHeight
                    optionCount={countries.length}
                    isSearchable={countries.length >= CONST.STANDARD_LIST_ITEM_LIMIT}
                    title={label}
                    backButtonSentryLabel={CONST.SENTRY_LABEL.CREATE_DISTANCE_RATE.COUNTRY_BACK_BUTTON}
                >
                    <ValueSelectionList
                        items={countries}
                        selectedItem={selectedItem}
                        isVisible={popoverProps.isVisible}
                        onItemSelected={(item) => {
                            onSelectCountry(item.value ?? '');
                            onClose();
                        }}
                    />
                </AnchoredSelectionListPopover>
            )}
            sentryLabel={CONST.SENTRY_LABEL.CREATE_DISTANCE_RATE.COUNTRY_FIELD}
        />
    );
}

export default EuroCountryDropdown;
