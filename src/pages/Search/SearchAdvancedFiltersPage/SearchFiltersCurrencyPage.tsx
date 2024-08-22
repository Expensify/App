import React, {useMemo} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SearchMultipleSelectionPicker from '@components/Search/SearchMultipleSelectionPicker';
import type {SearchMultipleSelectionPickerItem} from '@components/Search/SearchMultipleSelectionPicker';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as SearchActions from '@libs/actions/Search';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

function SearchFiltersCurrencyPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [currencyList] = useOnyx(ONYXKEYS.CURRENCY_LIST);
    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);
    const selectedCurrenciesCodes = searchAdvancedFiltersForm?.currency;

    const {selectedCurrenciesItems, currencyItems} = useMemo(() => {
        const selectedCurrencies: SearchMultipleSelectionPickerItem[] = [];
        const currencies: SearchMultipleSelectionPickerItem[] = [];

        Object.keys(currencyList ?? {}).forEach((currencyCode) => {
            if (selectedCurrenciesCodes?.includes(currencyCode) && !selectedCurrencies.some((currencyItem) => currencyItem.value === currencyCode)) {
                selectedCurrencies.push({name: `${currencyCode} - ${CurrencyUtils.getCurrencySymbol(currencyCode)}`, value: currencyCode});
            }

            if (!currencies.some((item) => item.value === currencyCode)) {
                currencies.push({name: `${currencyCode} - ${CurrencyUtils.getCurrencySymbol(currencyCode)}`, value: currencyCode});
            }
        });

        return {selectedCurrenciesItems: selectedCurrencies, currencyItems: currencies};
    }, [currencyList, selectedCurrenciesCodes]);
    const handleOnSubmit = (values: string[]) => {
        SearchActions.updateAdvancedFilters({currency: values});
    };

    return (
        <ScreenWrapper
            testID={SearchFiltersCurrencyPage.displayName}
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('search.filters.currency')}
                onBackButtonPress={() => {
                    Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS);
                }}
            />
            <View style={[styles.flex1]}>
                <SearchMultipleSelectionPicker
                    pickerTitle={translate('search.filters.currency')}
                    items={currencyItems}
                    initiallySelectedItems={selectedCurrenciesItems}
                    onSaveSelection={handleOnSubmit}
                />
            </View>
        </ScreenWrapper>
    );
}

SearchFiltersCurrencyPage.displayName = 'SearchFiltersCurrencyPage';

export default SearchFiltersCurrencyPage;
