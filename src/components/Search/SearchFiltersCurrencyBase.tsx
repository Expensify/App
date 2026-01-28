import React, {useMemo} from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useCurrencyList from '@hooks/useCurrencyList';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateAdvancedFilters} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {SearchAdvancedFiltersForm} from '@src/types/form';
import SearchMultipleSelectionPicker from './SearchMultipleSelectionPicker';
import type {SearchSingleSelectionPickerItem} from './SearchSingleSelectionPicker';
import SearchSingleSelectionPicker from './SearchSingleSelectionPicker';
import type {SearchCurrencyFilterKeys} from './types';

type SearchFiltersCurrencyBaseProps = {
    multiselect?: boolean;
    title: TranslationPaths;
    filterKey: SearchCurrencyFilterKeys;
};

function SearchFiltersCurrencyBase({title, filterKey, multiselect = false}: SearchFiltersCurrencyBaseProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {currencyList, getCurrencySymbol} = useCurrencyList();
    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, {canBeMissing: false});
    const selectedCurrencyData = searchAdvancedFiltersForm?.[filterKey];

    const {selectedCurrenciesItems, currencyItems} = useMemo(() => {
        const currencies: SearchSingleSelectionPickerItem[] = [];
        const selectedCurrencies: SearchSingleSelectionPickerItem[] = [];

        for (const currencyCode of Object.keys(currencyList)) {
            if (currencyList[currencyCode]?.retired) {
                continue;
            }

            if (Array.isArray(selectedCurrencyData) && selectedCurrencyData?.includes(currencyCode) && !selectedCurrencies.some((currencyItem) => currencyItem.value === currencyCode)) {
                selectedCurrencies.push({name: `${currencyCode} - ${getCurrencySymbol(currencyCode)}`, value: currencyCode});
            }

            if (!Array.isArray(selectedCurrencyData) && selectedCurrencyData === currencyCode) {
                selectedCurrencies.push({name: `${currencyCode} - ${getCurrencySymbol(currencyCode)}`, value: currencyCode});
            }

            if (!currencies.some((item) => item.value === currencyCode)) {
                currencies.push({name: `${currencyCode} - ${getCurrencySymbol(currencyCode)}`, value: currencyCode});
            }
        }

        return {selectedCurrenciesItems: selectedCurrencies, currencyItems: currencies};
    }, [currencyList, selectedCurrencyData, getCurrencySymbol]);

    const handleOnSubmit = (values: string[] | string | undefined) => {
        updateAdvancedFilters({[filterKey]: values ?? null} as Partial<SearchAdvancedFiltersForm>);
    };

    return (
        <ScreenWrapper
            testID="SearchFiltersCurrencyBase"
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate(title)}
                onBackButtonPress={() => {
                    Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS.getRoute());
                }}
            />
            <View style={[styles.flex1]}>
                {multiselect && (
                    <SearchMultipleSelectionPicker
                        items={currencyItems}
                        initiallySelectedItems={selectedCurrenciesItems}
                        onSaveSelection={handleOnSubmit}
                    />
                )}
                {!multiselect && (
                    <SearchSingleSelectionPicker
                        items={currencyItems}
                        initiallySelectedItem={selectedCurrenciesItems.at(0)}
                        onSaveSelection={handleOnSubmit}
                    />
                )}
            </View>
        </ScreenWrapper>
    );
}

export default SearchFiltersCurrencyBase;
