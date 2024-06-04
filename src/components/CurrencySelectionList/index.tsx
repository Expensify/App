import Str from 'expensify-common/lib/str';
import React, {useMemo, useState} from 'react';
import {withOnyx} from 'react-native-onyx';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import useLocalize from '@hooks/useLocalize';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {CurrencyListItem, CurrencySelectionListOnyxProps, CurrencySelectionListProps} from './types';

function CurrencySelectionList({searchInputLabel, initiallySelectedCurrencyCode, onSelect, currencyList}: CurrencySelectionListProps) {
    const [searchValue, setSearchValue] = useState('');
    const {translate} = useLocalize();

    const {sections, headerMessage} = useMemo(() => {
        const currencyOptions: CurrencyListItem[] = Object.entries(currencyList ?? {}).map(([currencyCode, currencyInfo]) => {
            const isSelectedCurrency = currencyCode === initiallySelectedCurrencyCode;
            return {
                currencyName: currencyInfo?.name ?? '',
                text: `${currencyCode} - ${CurrencyUtils.getCurrencySymbol(currencyCode)}`,
                currencyCode,
                keyForList: currencyCode,
                isSelected: isSelectedCurrency,
            };
        });

        const searchRegex = new RegExp(Str.escapeForRegExp(searchValue.trim()), 'i');
        const filteredCurrencies = currencyOptions.filter((currencyOption) => searchRegex.test(currencyOption.text ?? '') || searchRegex.test(currencyOption.currencyName));
        const isEmpty = searchValue.trim() && !filteredCurrencies.length;

        return {
            sections: isEmpty
                ? []
                : [
                      {
                          data: filteredCurrencies,
                      },
                  ],
            headerMessage: isEmpty ? translate('common.noResultsFound') : '',
        };
    }, [currencyList, searchValue, translate, initiallySelectedCurrencyCode]);

    return (
        <SelectionList
            sections={sections}
            ListItem={RadioListItem}
            textInputLabel={searchInputLabel}
            textInputValue={searchValue}
            onChangeText={setSearchValue}
            onSelectRow={onSelect}
            shouldDebounceRowSelect
            headerMessage={headerMessage}
            initiallyFocusedOptionKey={initiallySelectedCurrencyCode}
            showScrollIndicator
        />
    );
}

CurrencySelectionList.displayName = 'CurrencySelectionList';

const CurrencySelectionListWithOnyx = withOnyx<CurrencySelectionListProps, CurrencySelectionListOnyxProps>({
    currencyList: {key: ONYXKEYS.CURRENCY_LIST},
})(CurrencySelectionList);

export default CurrencySelectionListWithOnyx;
