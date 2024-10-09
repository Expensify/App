import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SearchMultipleSelectionPicker from '@components/Search/SearchMultipleSelectionPicker';
import type {SearchMultipleSelectionPickerItem} from '@components/Search/SearchMultipleSelectionPicker';
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
    const selectedTaxesItems: SearchMultipleSelectionPickerItem[] = [];
    Object.entries(allTaxRates).forEach(([taxRateName, taxRateKeys]) => {
        searchAdvancedFiltersForm?.taxRate?.forEach((taxRateKey) => {
            if (!taxRateKeys.includes(taxRateKey) || selectedTaxesItems.some((item) => item.name === taxRateName)) {
                return;
            }
            selectedTaxesItems.push({name: taxRateName, value: taxRateKeys});
        });
    });
    const policyID = searchAdvancedFiltersForm?.policyID;
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const singlePolicyTaxRates = policy?.taxRates?.taxes;

    const taxItems = useMemo(() => {
        if (!singlePolicyTaxRates) {
            return Object.entries(allTaxRates).map(([taxRateName, taxRateKeys]) => ({name: taxRateName, value: taxRateKeys}));
        }
        return Object.entries(singlePolicyTaxRates).map(([taxRatekey, taxRate]) => ({name: taxRate.name, value: [taxRatekey]}));
    }, [allTaxRates, singlePolicyTaxRates]);

    const updateTaxRateFilters = useCallback((values: string[]) => SearchActions.updateAdvancedFilters({taxRate: values}), []);

    return (
        <ScreenWrapper
            testID={SearchFiltersTaxRatePage.displayName}
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
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
                    onSaveSelection={updateTaxRateFilters}
                />
            </View>
        </ScreenWrapper>
    );
}

SearchFiltersTaxRatePage.displayName = 'SearchFiltersTaxRatePage';

export default SearchFiltersTaxRatePage;
