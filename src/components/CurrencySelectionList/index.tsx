import {Str} from 'expensify-common';
import React, {useCallback, useMemo, useState} from 'react';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import SelectionList from '@components/SelectionList/SelectionListWithSections';
import SelectableListItem from '@components/SelectionListWithSections/SelectableListItem';
import useCurrencyList from '@hooks/useCurrencyList';
import useLocalize from '@hooks/useLocalize';
import getMatchScore from '@libs/getMatchScore';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type {CurrencyListItem, CurrencySelectionListProps} from './types';

function CurrencySelectionList({
    searchInputLabel,
    initiallySelectedCurrencyCode,
    onSelect,
    didScreenTransitionEnd = true,
    selectedCurrencies = [],
    canSelectMultiple = false,
    recentlyUsedCurrencies,
    excludedCurrencies = [],
    ...restProps
}: CurrencySelectionListProps) {
    const {currencyList, getCurrencySymbol} = useCurrencyList();
    const [searchValue, setSearchValue] = useState('');
    const {translate} = useLocalize();
    const getUnselectedOptions = useCallback((options: CurrencyListItem[]) => options.filter((option) => !option.isSelected), []);
    const {sections, headerMessage} = useMemo(() => {
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
        const selectedOptions = filteredCurrencies.filter((option) => option.isSelected);
        const shouldDisplaySelectedOptionOnTop = selectedOptions.length > 0;
        const unselectedOptions = getUnselectedOptions(filteredCurrencies);
        const result = [];

        if (shouldDisplaySelectedOptionOnTop) {
            result.push({
                title: undefined,
                data: selectedOptions,
                sectionIndex: 0,
            });
        }

        if (shouldDisplayRecentlyOptions) {
            if (!isEmpty) {
                result.push(
                    {
                        title: translate('common.recents'),
                        data: shouldDisplaySelectedOptionOnTop ? getUnselectedOptions(recentlyUsedCurrencyOptions) : recentlyUsedCurrencyOptions,
                        sectionIndex: 1,
                    },
                    {title: translate('common.all'), data: shouldDisplayRecentlyOptions ? unselectedOptions : filteredCurrencies, sectionIndex: 2},
                );
            }
        } else if (!isEmpty) {
            result.push({
                data: shouldDisplaySelectedOptionOnTop ? unselectedOptions : filteredCurrencies,
                sectionIndex: 3,
            });
        }

        return {sections: result, headerMessage: isEmpty ? translate('common.noResultsFound') : ''};
    }, [currencyList, recentlyUsedCurrencies, searchValue, getUnselectedOptions, translate, initiallySelectedCurrencyCode, selectedCurrencies, excludedCurrencies, getCurrencySymbol]);

    const textInputOptions = {
        label: searchInputLabel,
        value: searchValue,
        onChangeText: setSearchValue,
        headerMessage,
    };

    return (
        <SelectionList
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...restProps}
            sections={sections}
            ListItem={canSelectMultiple ? SelectableListItem : RadioListItem}
            onSelectRow={onSelect}
            textInputOptions={textInputOptions}
            shouldShowTextInput={!!searchInputLabel}
            shouldSingleExecuteRowSelect
            initiallyFocusedItemKey={initiallySelectedCurrencyCode}
            canSelectMultiple={canSelectMultiple}
            showLoadingPlaceholder={!didScreenTransitionEnd}
        />
    );
}

export default CurrencySelectionList;
