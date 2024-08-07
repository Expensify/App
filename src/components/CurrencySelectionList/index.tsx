import {Str} from 'expensify-common';
import React, {useMemo, useState} from 'react';
import {withOnyx} from 'react-native-onyx';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import SelectableListItem from '@components/SelectionList/SelectableListItem';
import useLocalize from '@hooks/useLocalize';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {CurrencyListItem, CurrencySelectionListOnyxProps, CurrencySelectionListProps} from './types';

function CurrencySelectionList({searchInputLabel, initiallySelectedCurrencyCode, onSelect, currencyList, selectedCurrencies = [], canSelectMultiple = false}: CurrencySelectionListProps) {
    const [searchValue, setSearchValue] = useState('');
    const {translate} = useLocalize();

    const {sections, headerMessage} = useMemo(() => {
        const currencyOptions: CurrencyListItem[] = Object.entries(currencyList ?? {}).map(([currencyCode, currencyInfo]) => {
            const isSelectedCurrency = currencyCode === initiallySelectedCurrencyCode || selectedCurrencies.includes(currencyCode);
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

        if (canSelectMultiple) {
            filteredCurrencies.sort((currencyA, currencyB) => {
                if (currencyA.isSelected === currencyB.isSelected) {
                    return 0;
                }

                return currencyA.isSelected ? -1 : 1;
            });
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
    }, [currencyList, searchValue, canSelectMultiple, translate, initiallySelectedCurrencyCode, selectedCurrencies]);

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
