import React from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SearchMultipleSelectionPicker from '@components/SearchMultipleSelectionPicker';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as SearchActions from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

function SearchFiltersCurrencyPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);
    const selectedCurrencies = searchAdvancedFiltersForm?.currency;

    const [currencyList] = useOnyx(ONYXKEYS.CURRENCY_LIST);
    const currencyNames: string[] = [];
    Object.values(currencyList ?? {}).forEach((currency) => {
        if (!currency) {
            return;
        }
        currencyNames.push(currency.name);
    });
    const handleOnSubmit = () => {
        SearchActions.updateAdvancedFilters({...searchAdvancedFiltersForm, currency: selectedCurrencies});
        Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS);
    };

    return (
        <ScreenWrapper
            testID={SearchFiltersCurrencyPage.displayName}
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
            includeSafeAreaPaddingBottom={false}
        >
            <FullPageNotFoundView shouldShow={false}>
                <HeaderWithBackButton title={translate('search.filters.currency')} />
                <View style={[styles.flex1, styles.pb5]}>
                    <SearchMultipleSelectionPicker
                        pickerTitle={translate('search.filters.currency')}
                        items={currencyNames}
                        initiallySelectedItems={selectedCurrencies}
                        onSaveSelection={handleOnSubmit}
                    />
                </View>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

SearchFiltersCurrencyPage.displayName = 'SearchFiltersCurrencyPage';

export default SearchFiltersCurrencyPage;
