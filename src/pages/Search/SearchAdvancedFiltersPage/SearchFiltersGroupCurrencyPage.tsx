import React, {useMemo} from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SearchSingleSelectionPicker from '@components/Search/SearchSingleSelectionPicker';
import type {SearchSingleSelectionPickerItem} from '@components/Search/SearchSingleSelectionPicker';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateAdvancedFilters} from '@libs/actions/Search';
import {getCurrencySymbol} from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

function SearchFiltersGroupCurrencyPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [currencyList] = useOnyx(ONYXKEYS.CURRENCY_LIST);
    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);

    const {selectedCurrencyItem, currencyItems} = useMemo(() => {
        let selectedCurrency: SearchSingleSelectionPickerItem | undefined = undefined;
        const currencies: SearchSingleSelectionPickerItem[] = [];

        Object.keys(currencyList ?? {}).forEach((currencyCode) => {
            if (currencyList?.[currencyCode]?.retired) {
                return;
            }

            if (currencyCode === searchAdvancedFiltersForm?.groupCurrency) {
                selectedCurrency = {
                    name: `${currencyCode} - ${getCurrencySymbol(currencyCode)}`,
                    value: currencyCode,
                };
            }

            currencies.push({name: `${currencyCode} - ${getCurrencySymbol(currencyCode)}`, value: currencyCode});
        });

        return {selectedCurrencyItem: selectedCurrency, currencyItems: currencies};
    }, [currencyList, searchAdvancedFiltersForm?.groupCurrency]);

    const handleOnSubmit = (value: string | undefined) => {
        updateAdvancedFilters({groupCurrency: value ?? null});
    };

    return (
        <ScreenWrapper
            testID={SearchFiltersGroupCurrencyPage.displayName}
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('common.groupCurrency')}
                onBackButtonPress={() => {
                    Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS);
                }}
            />
            <View style={[styles.flex1]}>
                <SearchSingleSelectionPicker
                    items={currencyItems}
                    initiallySelectedItem={selectedCurrencyItem}
                    onSaveSelection={handleOnSubmit}
                />
            </View>
        </ScreenWrapper>
    );
}

SearchFiltersGroupCurrencyPage.displayName = 'SearchFiltersGroupCurrencyPage';

export default SearchFiltersGroupCurrencyPage;
