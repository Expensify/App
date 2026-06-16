import React, {useMemo} from 'react';
import {useCurrencyListActions, useCurrencyListState} from '@components/CurrencyListContextProvider';
import type {SingleSelectItem} from '@components/Search/FilterComponents/SingleSelect';
import {getCurrencyOptions} from '@libs/SearchUIUtils';
import SingleSelectPopup from './SingleSelectPopup';

type CurrencyPopupProps = {
    label?: string;
    onBackButtonPress?: () => void;
    closeOverlay: () => void;
    onChange: (item: SingleSelectItem<string> | undefined) => void;
    value?: string;
    defaultValue?: string;
    searchPlaceholder?: string;
    shouldShowList?: boolean;
};

function CurrencyPopup({label, onBackButtonPress, onChange, closeOverlay, value, defaultValue, searchPlaceholder, shouldShowList}: CurrencyPopupProps) {
    const {currencyList} = useCurrencyListState();
    const {getCurrencySymbol} = useCurrencyListActions();

    const currencyOptions = useMemo(() => getCurrencyOptions(currencyList, getCurrencySymbol), [currencyList, getCurrencySymbol]);
    const currencyValue = useMemo(() => currencyOptions.find((option) => option.value === value), [currencyOptions, value]);

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
