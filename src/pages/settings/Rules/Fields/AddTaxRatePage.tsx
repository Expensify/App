import React from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import RuleNotFoundPageWrapper from '@components/Rule/RuleNotFoundPageWrapper';
import ScreenWrapper from '@components/ScreenWrapper';
import SearchSingleSelectionPicker from '@components/Search/SearchSingleSelectionPicker';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateDraftRule} from '@libs/actions/User';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {getAllTaxRatesNamesAndValues} from '@libs/PolicyUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type AddTaxRatePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.RULES.EDIT_TAX>;

function AddTaxRatePage({route}: AddTaxRatePageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [form] = useOnyx(ONYXKEYS.FORMS.EXPENSE_RULE_FORM, {canBeMissing: true});
    const [allTaxRates] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true, selector: getAllTaxRatesNamesAndValues});

    const taxItems = Object.entries(allTaxRates ?? {}).map(([taxRateKey, taxRate]) => ({
        name: `${taxRate.name} (${taxRate.value})`,
        value: taxRateKey,
    }));
    const selectedTaxItem = form?.tax ? taxItems.find(({value}) => value === form.tax) : undefined;

    const hash = route.params?.hash;
    const backToRoute = hash ? ROUTES.SETTINGS_RULES_EDIT.getRoute(hash) : ROUTES.SETTINGS_RULES_ADD.getRoute();

    const onSave = (value?: string) => {
        updateDraftRule({tax: value});
    };

    return (
        <RuleNotFoundPageWrapper hash={hash}>
            <ScreenWrapper
                testID="AddTaxRatePage"
                shouldShowOfflineIndicatorInWideScreen
                offlineIndicatorStyle={styles.mtAuto}
                shouldEnableMaxHeight
            >
                <HeaderWithBackButton
                    title={translate('common.tax')}
                    onBackButtonPress={() => Navigation.goBack(backToRoute)}
                />
                <View style={[styles.flex1]}>
                    <SearchSingleSelectionPicker
                        backToRoute={backToRoute}
                        initiallySelectedItem={selectedTaxItem}
                        items={taxItems}
                        onSaveSelection={onSave}
                        shouldAutoSave
                    />
                </View>
            </ScreenWrapper>
        </RuleNotFoundPageWrapper>
    );
}

export default AddTaxRatePage;
