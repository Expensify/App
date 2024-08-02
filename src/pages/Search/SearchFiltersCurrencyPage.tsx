import React, {useState} from 'react';
import {useOnyx} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import CurrencySelectionList from '@components/CurrencySelectionList';
import type {CurrencyListItem} from '@components/CurrencySelectionList/types';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
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
    const [selectedCurrencies, setSelectedCurrencies] = useState<string[]>(searchAdvancedFiltersForm?.currency ?? []);

    const handleOnSelectOption = (option: CurrencyListItem) => {
        if (selectedCurrencies.includes(option.currencyCode)) {
            setSelectedCurrencies(selectedCurrencies.filter((currency) => currency !== option.currencyCode));
            return;
        }

        setSelectedCurrencies([option.currencyCode, ...selectedCurrencies]);
    };

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
            {({didScreenTransitionEnd}) => (
                <FullPageNotFoundView shouldShow={false}>
                    <HeaderWithBackButton title={translate('search.filters.currency')} />
                    <CurrencySelectionList
                        canSelectMultiple
                        selectedCurrencies={selectedCurrencies}
                        searchInputLabel={translate('common.search')}
                        onSelect={(option: CurrencyListItem) => {
                            if (!didScreenTransitionEnd) {
                                return;
                            }
                            handleOnSelectOption(option);
                        }}
                    />
                    <FormAlertWithSubmitButton
                        buttonText={translate('common.save')}
                        containerStyles={[styles.m4, styles.mb5]}
                        onSubmit={handleOnSubmit}
                        enabledWhenOffline
                    />
                </FullPageNotFoundView>
            )}
        </ScreenWrapper>
    );
}

SearchFiltersCurrencyPage.displayName = 'SearchFiltersCurrencyPage';

export default SearchFiltersCurrencyPage;
