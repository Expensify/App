import React from 'react';
import {useCurrencyListActions, useCurrencyListState} from '@components/CurrencyListContextProvider';
import type {SearchFilterCommonProps} from '@components/Search/types';
import {getCurrencyOptions} from '@libs/SearchUIUtils';
import MultiSelect from './MultiSelect';

type CurrencySelectorProps = SearchFilterCommonProps & {
    value: string[] | undefined;
    onChange: (item: string[]) => void;
};

function CurrencySelector({value = [], selectionListTextInputStyle, selectionListStyle, autoFocus, footer, onChange}: CurrencySelectorProps) {
    const {currencyList} = useCurrencyListState();
    const {getCurrencySymbol} = useCurrencyListActions();
    const currencyOptions = getCurrencyOptions(currencyList, getCurrencySymbol);
    const currencyValues = currencyOptions.filter((option) => value.includes(option.value));

    return (
        <MultiSelect
            value={currencyValues}
            items={currencyOptions}
            autoFocus={autoFocus}
            isSearchable
            selectionListTextInputStyle={selectionListTextInputStyle}
            selectionListStyle={selectionListStyle}
            footer={footer}
            onChange={(currencies) => onChange(currencies.map((currency) => currency.value))}
        />
    );
}

export default CurrencySelector;
