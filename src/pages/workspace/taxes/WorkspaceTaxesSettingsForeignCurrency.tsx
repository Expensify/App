import React from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TaxPicker from '@components/TaxPicker';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {setForeignCurrencyDefault} from '@libs/actions/Policy';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import type * as OptionsListUtils from '@libs/OptionsListUtils';
import * as TransactionUtils from '@libs/TransactionUtils';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
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

    const taxRates = policy?.taxRates;
    const foreignTaxDefault = taxRates?.foreignTaxDefault ?? '';
    const defaultExternalID = taxRates?.defaultExternalID ?? '';

    const selectedTaxRate =
        foreignTaxDefault === defaultExternalID ? taxRates && TransactionUtils.getDefaultTaxName(taxRates) : TransactionUtils.getTaxName(taxRates?.taxes ?? {}, foreignTaxDefault);

    const submit = (taxes: OptionsListUtils.TaxRatesOption) => {
        setForeignCurrencyDefault(policyID, taxes.data.code ?? '');
        Navigation.goBack(ROUTES.WORKSPACE_TAXES_SETTINGS.getRoute(policyID));
    };

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_TAXES_ENABLED}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                shouldEnableMaxHeight
                testID={WorkspaceTaxesSettingsForeignCurrency.displayName}
                style={styles.defaultModalContainer}
            >
                {({insets}) => (
                    <>
                        <HeaderWithBackButton title={translate('workspace.taxes.foreignDefault')} />

                        <View style={[styles.mb4, styles.flex1]}>
                            <TaxPicker
                                selectedTaxRate={selectedTaxRate}
                                policyID={policyID}
                                insets={insets}
                                onSubmit={submit}
                            />
                        </View>
                    </>
                )}
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceTaxesSettingsForeignCurrency.displayName = 'WorkspaceTaxesSettingsForeignCurrency';

export default withPolicyAndFullscreenLoading(WorkspaceTaxesSettingsForeignCurrency);
