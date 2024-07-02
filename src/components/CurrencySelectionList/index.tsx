import {Str} from 'expensify-common';
import React, {useMemo, useState} from 'react';
import {withOnyx} from 'react-native-onyx';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import useLocalize from '@hooks/useLocalize';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type {CurrencyListItem, CurrencySelectionListOnyxProps, CurrencySelectionListProps} from './types';

function CurrencySelectionList({searchInputLabel, initiallySelectedCurrencyCode, onSelect, currencyList, policyRecentlyUsedCurrencies}: CurrencySelectionListProps) {
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

        const policyRecentlyUsedCurrencyOptions: CurrencyListItem[] =
            policyRecentlyUsedCurrencies?.map((currencyCode) => {
                const currencyInfo = currencyList?.[currencyCode];
                const isSelectedCurrency = currencyCode === initiallySelectedCurrencyCode;
                return {
                    currencyName: currencyInfo?.name ?? '',
                    text: `${currencyCode} - ${CurrencyUtils.getCurrencySymbol(currencyCode)}`,
                    currencyCode,
                    keyForList: currencyCode,
                    isSelected: isSelectedCurrency,
                };
            }) ?? [];

        const searchRegex = new RegExp(Str.escapeForRegExp(searchValue.trim()), 'i');
        const filteredCurrencies = currencyOptions.filter((currencyOption) => searchRegex.test(currencyOption.text ?? '') || searchRegex.test(currencyOption.currencyName));
        const isEmpty = searchValue.trim() && !filteredCurrencies.length;
        const shouldDisplayRecentlyOptions = !isEmptyObject(policyRecentlyUsedCurrencyOptions) && !searchValue;

        if (shouldDisplayRecentlyOptions) {
            return {
                sections: isEmpty
                    ? []
                    : [
                          {title: translate('common.recents'), data: policyRecentlyUsedCurrencyOptions, shouldShow: shouldDisplayRecentlyOptions},
                          {title: translate('common.all'), data: filteredCurrencies},
                      ],
                headerMessage: isEmpty ? translate('common.noResultsFound') : '',
            };
        }
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
    }, [currencyList, searchValue, translate, initiallySelectedCurrencyCode, policyRecentlyUsedCurrencies]);

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
