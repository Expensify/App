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
import type {Policy} from '@src/types/onyx';

function SearchFiltersTaxRatePage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, {canBeMissing: true});
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true});
    const allTaxRates = getAllTaxRates(policies);
    const selectedTaxesItems: SearchMultipleSelectionPickerItem[] = [];
    // eslint-disable-next-line unicorn/no-array-for-each
    Object.entries(allTaxRates).forEach(([taxRateName, taxRateKeys]) => {
        // eslint-disable-next-line unicorn/no-array-for-each
        searchAdvancedFiltersForm?.taxRate?.forEach((taxRateKey) => {
            if (!taxRateKeys.includes(taxRateKey) || selectedTaxesItems.some((item) => item.name === taxRateName)) {
                return;
            }
            selectedTaxesItems.push({name: taxRateName, value: taxRateKeys});
        });
    });
    const policyIDs = useMemo(() => searchAdvancedFiltersForm?.policyID ?? [], [searchAdvancedFiltersForm?.policyID]);

    const selectedPoliciesMap = useMemo(() => {
        if (!policies || policyIDs.length === 0) {
            return null;
        }

        return policyIDs.reduce<Record<string, Policy>>((acc, policyID) => {
            const key = `${ONYXKEYS.COLLECTION.POLICY}${policyID}`;
            const policy = policies[key];
            if (policy) {
                acc[key] = policy;
            }
            return acc;
        }, {});
    }, [policies, policyIDs]);

    const taxItems = useMemo(() => {
        const scopedTaxRates = !selectedPoliciesMap || Object.keys(selectedPoliciesMap).length === 0 ? allTaxRates : getAllTaxRates(selectedPoliciesMap);

        return Object.entries(scopedTaxRates).map(([taxRateName, taxRateKeys]) => ({
            name: taxRateName,
            value: taxRateKeys,
        }));
    }, [allTaxRates, selectedPoliciesMap]);

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
                    Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS.getRoute());
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
