import React from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TaxPicker from '@components/TaxPicker';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import type * as TaxOptionsListUtils from '@libs/TaxOptionsListUtils';
import * as TransactionUtils from '@libs/TransactionUtils';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import {setForeignCurrencyDefault} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type WorkspaceTaxesSettingsForeignCurrencyProps = WithPolicyAndFullscreenLoadingProps &
    PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.TAXES_SETTINGS_FOREIGN_CURRENCY_DEFAULT>;
function WorkspaceTaxesSettingsForeignCurrency({
    route: {
        params: {policyID},
    },
    policy,
}: WorkspaceTaxesSettingsForeignCurrencyProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const foreignTaxDefault = policy?.taxRates?.foreignTaxDefault ?? '';

    const selectedTaxRate = TransactionUtils.getWorkspaceTaxesSettingsName(policy, foreignTaxDefault);

    const submit = (taxes: TaxOptionsListUtils.TaxRatesOption) => {
        setForeignCurrencyDefault(policyID, taxes.code ?? '');
        Navigation.goBack(ROUTES.WORKSPACE_TAXES_SETTINGS.getRoute(policyID));
    };

    const dismiss = () => {
        Navigation.goBack(ROUTES.WORKSPACE_TAXES_SETTINGS.getRoute(policyID));
    };

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_TAXES_ENABLED}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                shouldEnableMaxHeight
                testID="WorkspaceTaxesSettingsForeignCurrency"
                style={styles.defaultModalContainer}
            >
                <HeaderWithBackButton title={translate('workspace.taxes.foreignDefault')} />

                <View style={[styles.mb4, styles.flex1]}>
                    <TaxPicker
                        selectedTaxRate={selectedTaxRate}
                        policyID={policyID}
                        onSubmit={submit}
                        onDismiss={dismiss}
                        addBottomSafeAreaPadding
                    />
                </View>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default withPolicyAndFullscreenLoading(WorkspaceTaxesSettingsForeignCurrency);
