import {CONST as COMMON_CONST} from 'expensify-common';
import React, {useCallback} from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateXeroAutoSync} from '@libs/actions/connections/Xero';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {settingsPendingAction} from '@libs/PolicyUtils';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import {clearXeroErrorField} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';

type XeroAutoSyncPageRouteParams = {
    backTo?: Route;
};

function XeroAutoSyncPage({policy, route}: WithPolicyConnectionsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const policyID = policy?.id;
    const config = policy?.connections?.xero?.config;
    const {autoSync, pendingFields} = config ?? {};
    const {backTo} = route.params as XeroAutoSyncPageRouteParams;
    const accountingMethod = config?.export?.accountingMethod ?? COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH;
    const pendingAction = settingsPendingAction([CONST.XERO_CONFIG.AUTO_SYNC], pendingFields) ?? settingsPendingAction([CONST.XERO_CONFIG.ACCOUNTING_METHOD], pendingFields);

    const goBack = useCallback(() => {
        Navigation.goBack(backTo ?? ROUTES.POLICY_ACCOUNTING_XERO_ADVANCED.getRoute(policyID));
    }, [policyID, backTo]);

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                style={[styles.defaultModalContainer]}
                testID={XeroAutoSyncPage.displayName}
                enableEdgeToEdgeBottomSafeAreaPadding
            >
                <HeaderWithBackButton
                    title={translate('common.settings')}
                    onBackButtonPress={goBack}
                />
                <ToggleSettingOptionRow
                    key={translate('workspace.accounting.autoSync')}
                    title={translate('workspace.accounting.autoSync')}
                    subtitle={translate('workspace.xero.advancedConfig.autoSyncDescription')}
                    switchAccessibilityLabel={translate('workspace.xero.advancedConfig.autoSyncDescription')}
                    isActive={!!autoSync?.enabled}
                    wrapperStyle={[styles.pv2, styles.mh5]}
                    shouldPlaceSubtitleBelowSwitch
                    onToggle={() =>
                        updateXeroAutoSync(
                            policyID,
                            {
                                enabled: !autoSync?.enabled,
                            },
                            {enabled: autoSync?.enabled ?? undefined},
                        )
                    }
                    pendingAction={settingsPendingAction([CONST.XERO_CONFIG.ENABLED], pendingFields)}
                    errors={getLatestErrorField(config ?? {}, CONST.XERO_CONFIG.ENABLED)}
                    onCloseError={() => clearXeroErrorField(policyID, CONST.XERO_CONFIG.ENABLED)}
                />
                {!!autoSync?.enabled && (
                    <OfflineWithFeedback pendingAction={pendingAction}>
                        <MenuItemWithTopDescription
                            title={
                                accountingMethod === COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL
                                    ? translate(`workspace.xero.accountingMethods.values.${COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL}` as TranslationPaths)
                                    : translate(`workspace.xero.accountingMethods.values.${COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH}` as TranslationPaths)
                            }
                            description={translate('workspace.xero.accountingMethods.label')}
                            shouldShowRightIcon
                            onPress={() => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_XERO_ACCOUNTING_METHOD.getRoute(policyID, backTo))}
                        />
                    </OfflineWithFeedback>
                )}
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

XeroAutoSyncPage.displayName = 'XeroAutoSyncPage';

export default withPolicyConnections(XeroAutoSyncPage);
