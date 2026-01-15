import React from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SearchSingleSelectionPicker from '@components/Search/SearchSingleSelectionPicker';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateDraftRule} from '@libs/actions/User';
import Navigation from '@libs/Navigation/Navigation';
import {getAllTaxRatesNamesAndValues} from '@libs/PolicyUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

function AddTaxRatePage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [form] = useOnyx(ONYXKEYS.FORMS.EXPENSE_RULE_FORM, {canBeMissing: true});
    const [allTaxRates] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true, selector: getAllTaxRatesNamesAndValues});

    const taxItems = Object.entries(allTaxRates ?? {}).map(([taxRateKey, taxRate]) => ({
        name: `${taxRate.name} (${taxRate.value})`,
        value: taxRateKey,
    }));
    const selectedTaxItem = form?.tax ? taxItems.find(({value}) => value === form.tax) : undefined;

    const onSave = (value?: string) => {
        updateDraftRule({tax: value});
    };

    return (
        <ScreenWrapper
            testID="AddTaxRatePage"
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
                <SearchSingleSelectionPicker
                    backToRoute={ROUTES.SETTINGS_RULES_ADD.getRoute()}
                    initiallySelectedItem={selectedTaxItem}
                    items={taxItems}
                    onSaveSelection={onSave}
                    shouldShowResetButton={false}
                />
            </View>
        </ScreenWrapper>
    );
}

export default AddTaxRatePage;
