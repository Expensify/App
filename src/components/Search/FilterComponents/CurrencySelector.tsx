import React from 'react';
import {useCurrencyListActions, useCurrencyListState} from '@components/CurrencyListContextProvider';
import {getCurrencyOptions} from '@libs/SearchUIUtils';
import type {SearchFilterSelectionListStyleProps} from '../types';
import MultiSelect from './MultiSelect';

type CurrencySelectorProps = SearchFilterSelectionListStyleProps & {
    value: string[] | undefined;
    onChange: (item: string[]) => void;
};

function CurrencySelector({value = [], selectionListTextInputStyle, selectionListStyle, onChange}: CurrencySelectorProps) {
    const {currencyList} = useCurrencyListState();
    const {getCurrencySymbol} = useCurrencyListActions();
    const currencyOptions = getCurrencyOptions(currencyList, getCurrencySymbol);
    const currencyValues = currencyOptions.filter((option) => value.includes(option.value));

    return (
        <MultiSelect
            value={currencyValues}
            items={currencyOptions}
            isSearchable
            selectionListTextInputStyle={selectionListTextInputStyle}
            selectionListStyle={selectionListStyle}
            onChange={(currencies) => onChange(currencies.map((currency) => currency.value))}
        />
    );
}

export default CurrencySelector;
