import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SearchMultipleSelectionPicker from '@components/SearchMultipleSelectionPicker';
import type {SearchMultipleSelectionPickerItem} from '@components/SearchMultipleSelectionPicker';
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
    const allTaxRates = getAllTaxRates();
    const selectedTaxesItems = searchAdvancedFiltersForm?.taxRate?.map((taxRate) => ({name: allTaxRates[taxRate].name, value: taxRate}));
    const policyID = searchAdvancedFiltersForm?.policyID ?? '-1';
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const singlePolicyTaxRates = policy?.taxRates?.taxes;

    const taxItems = useMemo(() => {
        let taxRates: SearchMultipleSelectionPickerItem[] = [];
        if (!singlePolicyTaxRates) {
            taxRates = Object.entries(allTaxRates).map(([taxRateKey, taxRateInfo]) => ({name: taxRateInfo.name, value: taxRateKey}));
        } else {
            taxRates = Object.entries(singlePolicyTaxRates).map(([taxRateKey, taxRateInfo]) => ({name: taxRateInfo.name, value: taxRateKey}));
        }

        return taxRates;
    }, [allTaxRates, singlePolicyTaxRates]);

    const onSaveSelection = useCallback((values: string[]) => SearchActions.updateAdvancedFilters({taxRate: values}), []);

    return (
        <ScreenWrapper
            testID={SearchFiltersTaxRatePage.displayName}
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
        >
            <HeaderWithBackButton
                title={translate('workspace.taxes.taxRate')}
                onBackButtonPress={() => {
                    Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS);
                }}
            />
            <View style={[styles.flex1]}>
                <SearchMultipleSelectionPicker
                    pickerTitle={translate('workspace.taxes.taxRate')}
                    items={taxItems}
                    initiallySelectedItems={selectedTaxesItems}
                    onSaveSelection={onSaveSelection}
                />
            </View>
        </ScreenWrapper>
    );
}

SearchFiltersTaxRatePage.displayName = 'SearchFiltersCategoryPage';

export default SearchFiltersTaxRatePage;
