import React, {useMemo} from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SearchMultipleSelectionPicker from '@components/Search/SearchMultipleSelectionPicker';
import type {SearchMultipleSelectionPickerItem} from '@components/Search/SearchMultipleSelectionPicker';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateAdvancedFilters} from '@libs/actions/Search';
import {getCurrencySymbol} from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

function SearchFiltersCurrencyPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [currencyList] = useOnyx(ONYXKEYS.CURRENCY_LIST, {canBeMissing: false});
    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, {canBeMissing: true});

    const {selectedCurrenciesItems, currencyItems} = useMemo(() => {
        const selectedCurrencies: SearchMultipleSelectionPickerItem[] = [];
        const currencies: SearchMultipleSelectionPickerItem[] = [];

        Object.keys(currencyList ?? {}).forEach((currencyCode) => {
            if (currencyList?.[currencyCode]?.retired) {
                return;
            }

            if (selectedCurrenciesCodes?.includes(currencyCode) && !selectedCurrencies.some((currencyItem) => currencyItem.value === currencyCode)) {
                selectedCurrencies.push({name: `${currencyCode} - ${getCurrencySymbol(currencyCode)}`, value: currencyCode});
            }

            if (!currencies.some((item) => item.value === currencyCode)) {
                currencies.push({name: `${currencyCode} - ${getCurrencySymbol(currencyCode)}`, value: currencyCode});
            }
        });

        return {selectedCurrenciesItems: selectedCurrencies, currencyItems: currencies};
    }, [currencyList, selectedCurrenciesCodes]);
    const handleOnSubmit = (values: string[]) => {
        updateAdvancedFilters({currency: values});
    };

    return (
        <ScreenWrapper
            testID={SearchFiltersCurrencyPage.displayName}
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('search.filters.currency')}
                onBackButtonPress={() => {
                    Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS.getRoute());
                }}
            />
            <View style={[styles.flex1]}>
                <SearchMultipleSelectionPicker
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
