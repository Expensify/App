import React from 'react';
import {useCurrencyListActions, useCurrencyListState} from '@components/CurrencyListContextProvider';
import {getCurrencyOptions} from '@libs/SearchUIUtils';
import MultiSelect from './MultiSelect';

type CurrencySelectorProps = {
    value: string[] | undefined;
    onChange: (item: string[]) => void;
};

function CurrencySelector({value = [], onChange}: CurrencySelectorProps) {
    const {currencyList} = useCurrencyListState();
    const {getCurrencySymbol} = useCurrencyListActions();
    const currencyOptions = getCurrencyOptions(currencyList, getCurrencySymbol);
    const currencyValues = currencyOptions.filter((option) => value.includes(option.value));

    return (
        <MultiSelect
            value={currencyValues}
            items={currencyOptions}
            isSearchable
            onChange={(currencies) => onChange(currencies.map((currency) => currency.value))}
        />
    );
}

export default CurrencySelector;
