import React, {useMemo} from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SearchSingleSelectionPicker from '@components/Search/SearchSingleSelectionPicker';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateDraftMerchantRule} from '@libs/actions/User';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type AddTaxPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_MERCHANT_TAX>;

function AddTaxPage({route}: AddTaxPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const policyID = route.params?.policyID ?? '-1';

    const [form] = useOnyx(ONYXKEYS.FORMS.MERCHANT_RULE_FORM, {canBeMissing: true});
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {canBeMissing: true});

    const taxItems = useMemo(() => {
        const taxes = policy?.taxRates?.taxes ?? {};
        return Object.entries(taxes)
            .filter(([, tax]) => !tax.isDisabled)
            .map(([taxKey, tax]) => ({
                name: `${tax.name} (${tax.value})`,
                value: taxKey,
            }));
    }, [policy?.taxRates?.taxes]);

    const selectedTaxItem = form?.tax ? taxItems.find(({value}) => value === form.tax) : undefined;

    const backToRoute = ROUTES.RULES_MERCHANT_NEW.getRoute(policyID);

    const onSave = (value?: string) => {
        updateDraftMerchantRule({tax: value});
    };

    return (
        <ScreenWrapper
            testID="AddTaxPage"
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
    );
}

AddTaxPage.displayName = 'AddTaxPage';

export default AddTaxPage;
