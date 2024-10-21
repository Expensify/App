import React, {useMemo} from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type WorkspaceTaxesSettingsPageProps = WithPolicyAndFullscreenLoadingProps & PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.TAXES_SETTINGS>;

function WorkspaceTaxesSettingsPage({
    route: {
        params: {policyID},
    },
    policy,
}: WorkspaceTaxesSettingsPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const menuItems = useMemo(
        () => [
            {
                title: policy?.taxRates?.name,
                description: translate('workspace.taxes.customTaxName'),
                action: () => Navigation.navigate(ROUTES.WORKSPACE_TAXES_SETTINGS_CUSTOM_TAX_NAME.getRoute(policyID)),
                pendingAction: policy?.taxRates?.pendingFields?.name,
            },
            {
                title: policy?.taxRates?.taxes?.[policy?.taxRates?.defaultExternalID]?.name,
                description: translate('workspace.taxes.workspaceDefault'),
                action: () => Navigation.navigate(ROUTES.WORKSPACE_TAXES_SETTINGS_WORKSPACE_CURRENCY_DEFAULT.getRoute(policyID)),
                pendingAction: policy?.taxRates?.pendingFields?.defaultExternalID,
            },
            {
                title: policy?.taxRates?.taxes?.[policy?.taxRates?.foreignTaxDefault]?.name,
                description: translate('workspace.taxes.foreignDefault'),
                action: () => Navigation.navigate(ROUTES.WORKSPACE_TAXES_SETTINGS_FOREIGN_CURRENCY_DEFAULT.getRoute(policyID)),
                pendingAction: policy?.taxRates?.pendingFields?.foreignTaxDefault,
            },
        ],
        [policy?.taxRates, policyID, translate],
    );

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_TAXES_ENABLED}
        >
            <ScreenWrapper
                testID={WorkspaceTaxesSettingsPage.displayName}
                style={styles.defaultModalContainer}
            >
                <ScrollView contentContainerStyle={styles.flexGrow1}>
                    <HeaderWithBackButton title={translate('common.settings')} />
                    <View style={styles.flex1}>
                        {menuItems.map((item) => (
                            <OfflineWithFeedback
                                key={item.description}
                                pendingAction={item.pendingAction}
                            >
                                <MenuItemWithTopDescription
                                    shouldShowRightIcon
                                    title={item.title}
                                    description={item.description}
                                    style={[styles.moneyRequestMenuItem]}
                                    titleStyle={styles.flex1}
                                    onPress={item.action}
                                />
                            </OfflineWithFeedback>
                        ))}
                    </View>
                </ScrollView>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceTaxesSettingsPage.displayName = 'WorkspaceTaxesSettingsPage';

export default withPolicyAndFullscreenLoading(WorkspaceTaxesSettingsPage);
