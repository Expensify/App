import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import SelectionListWithSections from '@components/SelectionList/SelectionListWithSections';

import {useCurrencyListActions, useCurrencyListState} from '@hooks/useCurrencyList';
import useInitialSelection from '@hooks/useInitialSelection';
import useLocalize from '@hooks/useLocalize';

import getMatchScore from '@libs/getMatchScore';

import {isEmptyObject} from '@src/types/utils/EmptyObject';

import {Str} from 'expensify-common';
import React, {useMemo, useState} from 'react';

import type {CurrencyListItem, CurrencySelectionListProps} from './types';

const EMPTY_SELECTED_CURRENCIES: string[] = [];

function CurrencySelectionList({
    searchInputLabel,
    initiallySelectedCurrencyCode,
    onSelect,
    didScreenTransitionEnd = true,
    selectedCurrencies = EMPTY_SELECTED_CURRENCIES,
    recentlyUsedCurrencies,
    excludedCurrencies = [],
    ...restProps
}: CurrencySelectionListProps) {
    const {currencyList} = useCurrencyListState();
    const {getCurrencySymbol} = useCurrencyListActions();
    const [searchValue, setSearchValue] = useState('');
    const selectedCurrencyCodes = useMemo(() => [initiallySelectedCurrencyCode, ...selectedCurrencies].filter(Boolean), [initiallySelectedCurrencyCode, selectedCurrencies]);
    const initiallyPinnedCurrencyCodes = useInitialSelection(selectedCurrencyCodes, {resetOnFocus: true});
    const {translate} = useLocalize();
    const initiallyPinnedCurrencyCodeSet = new Set(initiallyPinnedCurrencyCodes);
    const getUnpinnedOptions = (options: CurrencyListItem[]) => options.filter((option) => !initiallyPinnedCurrencyCodeSet.has(option.currencyCode));

    const currencyOptions: CurrencyListItem[] = Object.entries(currencyList).reduce((acc, [currencyCode, currencyInfo]) => {
        const isSelectedCurrency = currencyCode === initiallySelectedCurrencyCode || selectedCurrencies.includes(currencyCode);
        if (!excludedCurrencies.includes(currencyCode) && (isSelectedCurrency || !currencyInfo?.retired)) {
            acc.push({
                currencyName: currencyInfo?.name ?? '',
                text: `${currencyCode} - ${getCurrencySymbol(currencyCode)}`,
                currencyCode,
                keyForList: currencyCode,
                isSelected: isSelectedCurrency,
            });
        }
        return acc;
    }, [] as CurrencyListItem[]);

    const recentlyUsedCurrencyOptions: CurrencyListItem[] = Array.isArray(recentlyUsedCurrencies)
        ? recentlyUsedCurrencies?.map((currencyCode) => {
              const currencyInfo = currencyList?.[currencyCode];
              const isSelectedCurrency = currencyCode === initiallySelectedCurrencyCode;
              return {
                  currencyName: currencyInfo?.name ?? '',
                  text: `${currencyCode} - ${getCurrencySymbol(currencyCode)}`,
                  currencyCode,
                  keyForList: currencyCode,
                  isSelected: isSelectedCurrency,
              };
          })
        : [];

    const searchRegex = new RegExp(Str.escapeForRegExp(searchValue.trim()), 'i');
    const filteredCurrencies = currencyOptions
        .filter((currencyOption) => searchRegex.test(currencyOption.text ?? '') || searchRegex.test(currencyOption.currencyName))
        .sort((currency1, currency2) => getMatchScore(currency2.text ?? '', searchValue) - getMatchScore(currency1.text ?? '', searchValue));

    const isEmpty = searchValue.trim() && !filteredCurrencies.length;
    const shouldDisplayRecentlyOptions = !isEmptyObject(recentlyUsedCurrencyOptions) && !searchValue;
    const initiallyPinnedOptions = filteredCurrencies.filter((option) => initiallyPinnedCurrencyCodeSet.has(option.currencyCode));
    const shouldDisplayInitiallyPinnedOptionsOnTop = initiallyPinnedOptions.length > 0;
    const unpinnedOptions = getUnpinnedOptions(filteredCurrencies);
    const sections = [];

    if (shouldDisplayInitiallyPinnedOptionsOnTop) {
        sections.push({
            title: undefined,
            data: initiallyPinnedOptions,
            sectionIndex: 0,
        });
    }

    if (shouldDisplayRecentlyOptions) {
        if (!isEmpty) {
            sections.push(
                {
                    title: translate('common.recents'),
                    data: shouldDisplayInitiallyPinnedOptionsOnTop ? getUnpinnedOptions(recentlyUsedCurrencyOptions) : recentlyUsedCurrencyOptions,
                    sectionIndex: 1,
                },
                {title: translate('common.all'), data: shouldDisplayRecentlyOptions ? unpinnedOptions : filteredCurrencies, sectionIndex: 2},
            );
        }
    } else if (!isEmpty) {
        sections.push({
            data: shouldDisplayInitiallyPinnedOptionsOnTop ? unpinnedOptions : filteredCurrencies,
            sectionIndex: 3,
        });
    }
    const textInputOptions = {
        label: searchInputLabel,
        value: searchValue,
        onChangeText: setSearchValue,
        headerMessage: isEmpty ? translate('common.noResultsFound') : undefined,
    };

    return (
        <SelectionListWithSections
            {...restProps}
            sections={sections}
            ListItem={SingleSelectListItem}
            onSelectRow={onSelect}
            textInputOptions={textInputOptions}
            shouldShowTextInput={!!searchInputLabel}
            shouldSingleExecuteRowSelect
            initiallyFocusedItemKey={initiallySelectedCurrencyCode}
            shouldShowLoadingPlaceholder={!didScreenTransitionEnd}
        />
    );
}

export default CurrencySelectionList;
