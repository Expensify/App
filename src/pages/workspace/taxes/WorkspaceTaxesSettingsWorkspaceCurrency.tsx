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
import type * as OptionsListUtils from '@libs/OptionsListUtils';
import * as TransactionUtils from '@libs/TransactionUtils';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import {setWorkspaceCurrencyDefault} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type WorkspaceTaxesSettingsWorkspaceCurrencyProps = WithPolicyAndFullscreenLoadingProps &
    PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.TAXES_SETTINGS_WORKSPACE_CURRENCY_DEFAULT>;

function WorkspaceTaxesSettingsWorkspaceCurrency({
    route: {
        params: {policyID},
    },
    policy,
}: WorkspaceTaxesSettingsWorkspaceCurrencyProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const defaultExternalID = policy?.taxRates?.defaultExternalID ?? '';
    const selectedTaxRate = policy?.taxRates && TransactionUtils.getWorkspaceTaxesSettingsName(policy, defaultExternalID);

    const submit = (taxes: OptionsListUtils.TaxRatesOption) => {
        setWorkspaceCurrencyDefault(policyID, taxes.code ?? '');
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
                includeSafeAreaPaddingBottom={false}
                shouldEnableMaxHeight
                testID={WorkspaceTaxesSettingsWorkspaceCurrency.displayName}
                style={styles.defaultModalContainer}
            >
                {({insets}) => (
                    <>
                        <HeaderWithBackButton title={translate('workspace.taxes.workspaceDefault')} />

                        <View style={[styles.mb4, styles.flex1]}>
                            <TaxPicker
                                selectedTaxRate={selectedTaxRate}
                                policyID={policyID}
                                insets={insets}
                                onSubmit={submit}
                                onDismiss={dismiss}
                            />
                        </View>
                    </>
                )}
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceTaxesSettingsWorkspaceCurrency.displayName = 'WorkspaceTaxesSettingsWorkspaceCurrency';

export default withPolicyAndFullscreenLoading(WorkspaceTaxesSettingsWorkspaceCurrency);
