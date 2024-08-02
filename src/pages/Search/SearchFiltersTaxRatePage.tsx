import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import MultipleSelectionPicker from '@components/SearchMultipleSelectionPicker';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {getAllTaxRates} from '@libs/PolicyUtils';
import * as SearchActions from '@userActions/Search';
import ONYXKEYS from '@src/ONYXKEYS';

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

    const onSaveSelection = useCallback((values: string[]) => SearchActions.updateAdvancedFilters({category: values}), []);

    return (
        <ScreenWrapper
            testID={SearchFiltersTaxRatePage.displayName}
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
        >
            <FullPageNotFoundView shouldShow={false}>
                <HeaderWithBackButton title={translate('workspace.taxes.taxRate')} />
                <View style={[styles.flex1]}>
                    <MultipleSelectionPicker
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
