import {Str} from 'expensify-common';
import React, {useMemo, useState} from 'react';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import SelectionListWithSections from '@components/SelectionList/SelectionListWithSections';
import {useCurrencyListActions, useCurrencyListState} from '@hooks/useCurrencyList';
import useInitialSelectionRef from '@hooks/useInitialSelectionRef';
import useLocalize from '@hooks/useLocalize';
import getMatchScore from '@libs/getMatchScore';
import {moveInitialSelectionToTopByValue} from '@libs/SelectionListOrderUtils';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type {CurrencyListItem, CurrencySelectionListProps} from './types';

function CurrencySelectionList({
    searchInputLabel,
    initiallySelectedCurrencyCode,
    onSelect,
    didScreenTransitionEnd = true,
    selectedCurrencies = [],
    recentlyUsedCurrencies,
    excludedCurrencies = [],
    ...restProps
}: CurrencySelectionListProps) {
    const {currencyList} = useCurrencyListState();
    const {getCurrencySymbol} = useCurrencyListActions();
    const [searchValue, setSearchValue] = useState('');
    const {translate} = useLocalize();
    const getUnselectedOptions = (options: CurrencyListItem[]) => options.filter((option) => !option.isSelected);
    const initialSelectedCurrencyCodes = useMemo(() => {
        const codes = new Set<string>();
        if (initiallySelectedCurrencyCode) {
            codes.add(initiallySelectedCurrencyCode);
        }
        for (const currencyCode of selectedCurrencies) {
            codes.add(currencyCode);
        }
        return Array.from(codes);
    }, [initiallySelectedCurrencyCode, selectedCurrencies]);
    const initialSelectedCurrencySnapshot = useInitialSelectionRef(initialSelectedCurrencyCodes, {resetDeps: [initialSelectedCurrencyCodes], resetOnFocus: true});

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

    const shouldReorderInitialSelection = !searchValue && initialSelectedCurrencySnapshot.length > 0;
    const displayCurrencies = shouldReorderInitialSelection
        ? moveInitialSelectionToTopByValue(
              filteredCurrencies.map((currency) => ({...currency, value: currency.currencyCode})),
              initialSelectedCurrencySnapshot,
          )
        : filteredCurrencies;

    const isEmpty = searchValue.trim() && !displayCurrencies.length;
    const shouldDisplayRecentlyOptions = !isEmptyObject(recentlyUsedCurrencyOptions) && !searchValue;
    const selectedOptions = displayCurrencies.filter((option) => option.isSelected);
    const shouldDisplaySelectedOptionOnTop = selectedOptions.length > 0;
    const unselectedOptions = getUnselectedOptions(displayCurrencies);
    const sections = [];

    if (shouldDisplaySelectedOptionOnTop) {
        sections.push({
            title: undefined,
            data: selectedOptions,
            sectionIndex: 0,
        });
    }

    if (shouldDisplayRecentlyOptions) {
        if (!isEmpty) {
            sections.push(
                {
                    title: translate('common.recents'),
                    data: shouldDisplaySelectedOptionOnTop ? getUnselectedOptions(recentlyUsedCurrencyOptions) : recentlyUsedCurrencyOptions,
                    sectionIndex: 1,
                },
                {title: translate('common.all'), data: shouldDisplayRecentlyOptions ? unselectedOptions : displayCurrencies, sectionIndex: 2},
            );
        }
    } else if (!isEmpty) {
        sections.push({
            data: shouldDisplaySelectedOptionOnTop ? unselectedOptions : displayCurrencies,
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
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...restProps}
            sections={sections}
            ListItem={RadioListItem}
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
