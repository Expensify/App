import {Str} from 'expensify-common';
import React, {useCallback, useMemo, useState} from 'react';
import {withOnyx} from 'react-native-onyx';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import SelectableListItem from '@components/SelectionList/SelectableListItem';
import useLocalize from '@hooks/useLocalize';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type {CurrencyListItem, CurrencySelectionListOnyxProps, CurrencySelectionListProps} from './types';

function CurrencySelectionList({
    searchInputLabel,
    initiallySelectedCurrencyCode,
    onSelect,
    currencyList,
    selectedCurrencies = [],
    canSelectMultiple = false,
    recentlyUsedCurrencies,
}: CurrencySelectionListProps) {
    const [searchValue, setSearchValue] = useState('');
    const {translate} = useLocalize();
    const getUnselectedOptions = useCallback((options: CurrencyListItem[]) => options.filter((option) => !option.isSelected), []);
    const {sections, headerMessage} = useMemo(() => {
        const currencyOptions: CurrencyListItem[] = Object.entries(currencyList ?? {}).reduce((acc, [currencyCode, currencyInfo]) => {
            const isSelectedCurrency = currencyCode === initiallySelectedCurrencyCode || selectedCurrencies.includes(currencyCode);
            if (isSelectedCurrency || !currencyInfo?.retired) {
                acc.push({
                    currencyName: currencyInfo?.name ?? '',
                    text: `${currencyCode} - ${CurrencyUtils.getCurrencySymbol(currencyCode)}`,
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
                      text: `${currencyCode} - ${CurrencyUtils.getCurrencySymbol(currencyCode)}`,
                      currencyCode,
                      keyForList: currencyCode,
                      isSelected: isSelectedCurrency,
                  };
              })
            : [];

        const searchRegex = new RegExp(Str.escapeForRegExp(searchValue.trim()), 'i');
        const filteredCurrencies = currencyOptions.filter((currencyOption) => searchRegex.test(currencyOption.text ?? '') || searchRegex.test(currencyOption.currencyName));
        const isEmpty = searchValue.trim() && !filteredCurrencies.length;
        const shouldDisplayRecentlyOptions = !isEmptyObject(recentlyUsedCurrencyOptions) && !searchValue;
        const selectedOptions = filteredCurrencies.filter((option) => option.isSelected);
        const shouldDisplaySelectedOptionOnTop = selectedOptions.length > 0;
        const unselectedOptions = getUnselectedOptions(filteredCurrencies);
        const result = [];

        if (shouldDisplaySelectedOptionOnTop) {
            result.push({
                title: '',
                data: selectedOptions,
                shouldShow: true,
            });
        }

        if (shouldDisplayRecentlyOptions) {
            if (!isEmpty) {
                result.push(
                    {
                        title: translate('common.recents'),
                        data: shouldDisplaySelectedOptionOnTop ? getUnselectedOptions(recentlyUsedCurrencyOptions) : recentlyUsedCurrencyOptions,
                        shouldShow: shouldDisplayRecentlyOptions,
                    },
                    {title: translate('common.all'), data: shouldDisplayRecentlyOptions ? unselectedOptions : filteredCurrencies},
                );
            }
        } else if (!isEmpty) {
            result.push({
                data: shouldDisplaySelectedOptionOnTop ? unselectedOptions : filteredCurrencies,
            });
        }

        return {sections: result, headerMessage: isEmpty ? translate('common.noResultsFound') : ''};
    }, [currencyList, searchValue, translate, initiallySelectedCurrencyCode, selectedCurrencies, getUnselectedOptions, recentlyUsedCurrencies]);

    return (
        <SelectionList
            sections={sections}
            ListItem={canSelectMultiple ? SelectableListItem : RadioListItem}
            textInputLabel={searchInputLabel}
            textInputValue={searchValue}
            onChangeText={setSearchValue}
            onSelectRow={onSelect}
            shouldSingleExecuteRowSelect
            headerMessage={headerMessage}
            initiallyFocusedOptionKey={initiallySelectedCurrencyCode}
            showScrollIndicator
            canSelectMultiple={canSelectMultiple}
        />
    );
}

CurrencySelectionList.displayName = 'CurrencySelectionList';

const CurrencySelectionListWithOnyx = withOnyx<CurrencySelectionListProps, CurrencySelectionListOnyxProps>({
    currencyList: {key: ONYXKEYS.CURRENCY_LIST},
})(CurrencySelectionList);

export default CurrencySelectionListWithOnyx;
