import {useCurrencyListActions, useCurrencyListState} from '@components/CurrencyListContextProvider';
import type {SingleSelectItem} from '@components/Search/FilterComponents/SingleSelect';

import {getCurrencyOptions} from '@libs/SearchUIUtils';

import React from 'react';

import SingleSelectPopup from './SingleSelectPopup';

type CurrencyPopupProps = {
    /** The label to show when in an overlay on mobile */
    label?: string;

    /** Function to call when the back button is pressed */
    onBackButtonPress?: () => void;

    /** Function to call to close the overlay */
    closeOverlay: () => void;

    /** Function to call when a currency is selected */
    onChange: (item: SingleSelectItem<string> | undefined) => void;

    /** The currently selected currency code */
    value?: string;

    /** The currency code to select when reset is clicked */
    defaultValue?: string;

    /** Search input placeholder */
    searchPlaceholder?: string;

    /** Whether the currency list should be visible */
    shouldShowList?: boolean;
};

function CurrencyPopup({label, onBackButtonPress, onChange, closeOverlay, value, defaultValue, searchPlaceholder, shouldShowList}: CurrencyPopupProps) {
    const {currencyList} = useCurrencyListState();
    const {getCurrencySymbol} = useCurrencyListActions();

    const currencyOptions = getCurrencyOptions(currencyList, getCurrencySymbol);
    const currencyValue = currencyOptions.find((option) => option.value === value);

    return (
        <SingleSelectPopup
            items={currencyOptions}
            value={currencyValue}
            label={label}
            onBackButtonPress={onBackButtonPress}
            closeOverlay={closeOverlay}
            onChange={onChange}
            isSearchable
            searchPlaceholder={searchPlaceholder}
            defaultValue={defaultValue}
            shouldShowList={shouldShowList}
            shouldUseFixedPopoverHeight
        />
    );
}

export default CurrencyPopup;
