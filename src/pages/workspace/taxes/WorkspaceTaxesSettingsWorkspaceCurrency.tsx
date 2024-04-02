import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import type {ListItem} from '@components/SelectionList/types';
import TaxPicker from '@components/TaxPicker';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {setWorkspaceCurrencyDefault} from '@libs/actions/Policy';
import Navigation from '@libs/Navigation/Navigation';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import AdminPolicyAccessOrNotFoundWrapper from '@pages/workspace/AdminPolicyAccessOrNotFoundWrapper';
import FeatureEnabledAccessOrNotFoundWrapper from '@pages/workspace/FeatureEnabledAccessOrNotFoundWrapper';
import PaidPolicyAccessOrNotFoundWrapper from '@pages/workspace/PaidPolicyAccessOrNotFoundWrapper';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type WorkspaceTaxesSettingsWorkspaceCurrencyProps = WithPolicyAndFullscreenLoadingProps &
    StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.TAXES_SETTINGS_WORKSPACE_CURRENCY_DEFAULT>;

function WorkspaceTaxesSettingsWorkspaceCurrency({
    route: {
        params: {policyID},
    },
    policy,
}: WorkspaceTaxesSettingsWorkspaceCurrencyProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const submit = ({keyForList}: ListItem) => {
        setWorkspaceCurrencyDefault(policyID, keyForList ?? '');
        Navigation.goBack(ROUTES.WORKSPACE_TAXES_SETTINGS.getRoute(policyID));
    };

    return (
        <AdminPolicyAccessOrNotFoundWrapper policyID={policyID}>
            <PaidPolicyAccessOrNotFoundWrapper policyID={policyID}>
                <FeatureEnabledAccessOrNotFoundWrapper
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
                                        selectedTaxRate={policy?.taxRates?.defaultExternalID}
                                        taxRates={policy?.taxRates}
                                        insets={insets}
                                        onSubmit={submit}
                                    />
                                </View>
                            </>
                        )}
                    </ScreenWrapper>
                </FeatureEnabledAccessOrNotFoundWrapper>
            </PaidPolicyAccessOrNotFoundWrapper>
        </AdminPolicyAccessOrNotFoundWrapper>
    );
}

WorkspaceTaxesSettingsWorkspaceCurrency.displayName = 'WorkspaceTaxesSettingsWorkspaceCurrency';

export default withPolicyAndFullscreenLoading(WorkspaceTaxesSettingsWorkspaceCurrency);
