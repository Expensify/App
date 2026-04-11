import React from 'react';
import {useCurrencyListActions, useCurrencyListState} from '@components/CurrencyListContextProvider';
import MultiSelectFilterPopup from '@components/Search/SearchPageHeader/MultiSelectFilterPopup';
import {getCurrencyOptions} from '@libs/SearchUIUtils';
import type {TranslationPaths} from '@src/languages/types';
import type {MultiSelectItem} from './MultiSelectPopup';

type CurrencySelectPopupProps = {
    translationKey: TranslationPaths;
    value: string[];
    closeOverlay: () => void;
    onChange: (item: Array<MultiSelectItem<string>>) => void;
};

function CurrencySelectPopup({translationKey, value, onChange, closeOverlay}: CurrencySelectPopupProps) {
    const {currencyList} = useCurrencyListState();
    const {getCurrencySymbol} = useCurrencyListActions();
    const currencyOptions = getCurrencyOptions(currencyList, getCurrencySymbol);
    const currencyValues = currencyOptions.filter((option) => value.includes(option.value));

    return (
        <MultiSelectFilterPopup
            closeOverlay={closeOverlay}
            translationKey={translationKey}
            items={currencyOptions}
            value={currencyValues}
            isSearchable
            onChangeCallback={onChange}
        />
    );
}

export default CurrencySelectPopup;
