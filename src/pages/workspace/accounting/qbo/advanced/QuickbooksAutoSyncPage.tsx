import {CONST as COMMON_CONST} from 'expensify-common';
import React from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateQuickbooksOnlineAutoSync} from '@libs/actions/connections/QuickbooksOnline';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {settingsPendingAction} from '@libs/PolicyUtils';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import {clearQuickbooksOnlineAutoSyncErrorField} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ROUTES from '@src/ROUTES';

function QuickbooksAutoSyncPage({policy, route}: WithPolicyConnectionsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const config = policy?.connections?.quickbooksOnline?.config;
    const policyID = route.params.policyID;
    const accountingMethod = config?.accountingMethod ?? COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH;
    const pendingAction =
        settingsPendingAction([CONST.QUICKBOOKS_CONFIG.AUTO_SYNC], config?.pendingFields) ?? settingsPendingAction([CONST.QUICKBOOKS_CONFIG.ACCOUNTING_METHOD], config?.pendingFields);

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CATEGORIES_ENABLED}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                style={[styles.defaultModalContainer]}
                testID={QuickbooksAutoSyncPage.displayName}
            >
                <HeaderWithBackButton
                    title={translate('common.settings')}
                    onBackButtonPress={() => Navigation.goBack(ROUTES.WORKSPACE_ACCOUNTING_QUICKBOOKS_ONLINE_ADVANCED.getRoute(policyID))}
                />
                <ToggleSettingOptionRow
                    title={translate('workspace.accounting.autoSync')}
                    subtitle={translate('workspace.qbo.autoSyncDescription')}
                    isActive={!!config?.autoSync?.enabled}
                    wrapperStyle={[styles.pv2, styles.mh5]}
                    switchAccessibilityLabel={translate('workspace.qbo.advancedConfig.autoSyncDescription')}
                    shouldPlaceSubtitleBelowSwitch
                    onCloseError={() => clearQuickbooksOnlineAutoSyncErrorField(policyID)}
                    onToggle={(isEnabled) => updateQuickbooksOnlineAutoSync(policyID, isEnabled)}
                    pendingAction={pendingAction}
                    errors={getLatestErrorField(config, CONST.QUICKBOOKS_CONFIG.AUTO_SYNC)}
                />
                {!!config?.autoSync?.enabled && (
                    <OfflineWithFeedback pendingAction={pendingAction}>
                        <MenuItemWithTopDescription
                            title={
                                accountingMethod === COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL
                                    ? translate(`workspace.accountingMethods.values.${COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL}` as TranslationPaths)
                                    : translate(`workspace.accountingMethods.values.${COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH}` as TranslationPaths)
                            }
                            description={translate('workspace.accountingMethods.label')}
                            shouldShowRightIcon
                            onPress={() => Navigation.navigate(ROUTES.WORKSPACE_ACCOUNTING_QUICKBOOKS_ONLINE_ACCOUNTING_METHOD.getRoute(policyID))}
                        />
                    </OfflineWithFeedback>
                )}
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

QuickbooksAutoSyncPage.displayName = 'QuickbooksAutoSyncPage';

export default withPolicyConnections(QuickbooksAutoSyncPage);
