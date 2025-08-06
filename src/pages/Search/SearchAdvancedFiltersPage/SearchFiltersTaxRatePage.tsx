import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SearchMultipleSelectionPicker from '@components/Search/SearchMultipleSelectionPicker';
import type {SearchMultipleSelectionPickerItem} from '@components/Search/SearchMultipleSelectionPicker';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {getAllTaxRates} from '@libs/PolicyUtils';
import {updateAdvancedFilters} from '@userActions/Search';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

function SearchFiltersTaxRatePage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, {canBeMissing: true});
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
    const policyIDs = searchAdvancedFiltersForm?.policyID ?? [];
    const [policies] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}`, {
        selector: (allPolicies) => (allPolicies ? Object.values(allPolicies).filter((policy) => policy && policyIDs.includes(policy.id)) : undefined),
        canBeMissing: true,
    });
    const selectedPoliciesTaxRates = policies?.map((policy) => policy?.taxRates?.taxes).filter((taxRates) => !!taxRates);

    const taxItems = useMemo(() => {
        if (!selectedPoliciesTaxRates || selectedPoliciesTaxRates?.length === 0) {
            return Object.entries(allTaxRates).map(([taxRateName, taxRateKeys]) => ({name: taxRateName, value: taxRateKeys}));
        }
        const selectedPoliciesTaxRatesItems = selectedPoliciesTaxRates.reduce(
            (acc, taxRates) => {
                if (!taxRates) {
                    return acc;
                }
                Object.entries(taxRates).forEach(([taxRateKey, taxRate]) => {
                    if (!acc[taxRate.name]) {
                        acc[taxRate.name] = [];
                    }
                    if (acc[taxRate.name].includes(taxRateKey)) {
                        return;
                    }
                    acc[taxRate.name].push(taxRateKey);
                });
                return acc;
            },
            {} as Record<string, string[]>,
        );

        return Object.entries(selectedPoliciesTaxRatesItems).map(([taxRateName, taxRateKeys]) => ({name: taxRateName, value: taxRateKeys}));
    }, [allTaxRates, selectedPoliciesTaxRates]);

    const updateTaxRateFilters = useCallback((values: string[]) => updateAdvancedFilters({taxRate: values}), []);

    return (
        <ScreenWrapper
            testID={SearchFiltersTaxRatePage.displayName}
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
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
