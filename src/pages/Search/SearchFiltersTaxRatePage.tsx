import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SearchMultipleSelectionPicker from '@components/SearchMultipleSelectionPicker';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {getAllTaxRates} from '@libs/PolicyUtils';
import * as SearchActions from '@userActions/Search';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

function SearchFiltersTaxRatePage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);
    const selectedTaxes = searchAdvancedFiltersForm?.taxRate;
    const policyID = searchAdvancedFiltersForm?.policyID ?? '-1';
    const allTaxRates = getAllTaxRates();
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const singlePolicyTaxRates = policy?.taxRates?.taxes;

    const taxNames = useMemo(() => {
        let taxRates: string[] = [];
        if (!singlePolicyTaxRates) {
            taxRates = allTaxRates.map((taxRate) => taxRate.name);
        } else {
            taxRates = Object.values(singlePolicyTaxRates).map((taxRate) => taxRate.name);
        }

        return [...new Set(taxRates)];
    }, [allTaxRates, singlePolicyTaxRates]);

    const onSaveSelection = useCallback((values: string[]) => SearchActions.updateAdvancedFilters({taxRate: values}), []);

    return (
        <ScreenWrapper
            testID={SearchFiltersTaxRatePage.displayName}
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
        >
            <FullPageNotFoundView shouldShow={false}>
                <HeaderWithBackButton
                    title={translate('workspace.taxes.taxRate')}
                    onBackButtonPress={() => {
                        Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS);
                    }}
                />
                <View style={[styles.flex1]}>
                    <SearchMultipleSelectionPicker
                        pickerTitle={translate('workspace.taxes.taxRate')}
                        items={taxNames}
                        initiallySelectedItems={selectedTaxes}
                        onSaveSelection={onSaveSelection}
                    />
                </View>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

SearchFiltersTaxRatePage.displayName = 'SearchFiltersCategoryPage';

export default SearchFiltersTaxRatePage;
