import {CONST as COMMON_CONST} from 'expensify-common';
import React, {useCallback} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import ConnectionLayout from '@components/ConnectionLayout';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateQuickbooksDesktopAutoSync} from '@libs/actions/connections/QuickbooksDesktop';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {settingsPendingAction} from '@libs/PolicyUtils';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import {clearQBDErrorField} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import type {Policy} from '@src/types/onyx';

type QuickbooksDesktopAutoSyncPageBaseParams = {
    policy: OnyxEntry<Policy>;
    navigateBackTo?: Route;
};

function QuickbooksDesktopAutoSyncPageBase({policy, navigateBackTo}: QuickbooksDesktopAutoSyncPageBaseParams) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const policyID = policy?.id;
    const config = policy?.connections?.quickbooksDesktop?.config;
    const {autoSync, pendingFields} = config ?? {};
    const accountingMethod = config?.export?.accountingMethod ?? COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH;
    const pendingAction =
        settingsPendingAction([CONST.QUICKBOOKS_DESKTOP_CONFIG.AUTO_SYNC], pendingFields) ?? settingsPendingAction([CONST.QUICKBOOKS_DESKTOP_CONFIG.ACCOUNTING_METHOD], pendingFields);

    const goBack = useCallback(() => {
        Navigation.goBack(navigateBackTo ?? ROUTES.WORKSPACE_ACCOUNTING_QUICKBOOKS_DESKTOP_ADVANCED.getRoute(policyID));
    }, [policyID, navigateBackTo]);

    return (
        <ConnectionLayout
            displayName="QuickbooksDesktopAutoSyncPageBase"
            headerTitle="common.settings"
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={styles.pb2}
            titleStyle={styles.ph5}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.QBD}
            onBackButtonPress={goBack}
        >
            <ToggleSettingOptionRow
                key={translate('workspace.accounting.autoSync')}
                title={translate('workspace.accounting.autoSync')}
                subtitle={translate('workspace.qbd.advancedConfig.autoSyncDescription')}
                switchAccessibilityLabel={translate('workspace.qbd.advancedConfig.autoSyncDescription')}
                isActive={!!autoSync?.enabled}
                wrapperStyle={[styles.pv2, styles.mh5]}
                shouldPlaceSubtitleBelowSwitch
                onToggle={() => {
                    if (!policyID) {
                        return;
                    }
                    updateQuickbooksDesktopAutoSync(policyID, !autoSync?.enabled);
                }}
                pendingAction={pendingAction}
                errors={getLatestErrorField(config ?? {}, CONST.QUICKBOOKS_DESKTOP_CONFIG.AUTO_SYNC_ENABLED)}
                onCloseError={() => clearQBDErrorField(policyID, CONST.QUICKBOOKS_DESKTOP_CONFIG.AUTO_SYNC_ENABLED)}
            />
            {!!autoSync?.enabled && (
                <OfflineWithFeedback pendingAction={pendingAction}>
                    <MenuItemWithTopDescription
                        title={
                            accountingMethod === COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL
                                ? translate(`workspace.qbd.accountingMethods.values.${COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL}` as TranslationPaths)
                                : translate(`workspace.qbd.accountingMethods.values.${COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH}` as TranslationPaths)
                        }
                        description={translate('workspace.qbd.accountingMethods.label')}
                        shouldShowRightIcon
                        onPress={() => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_ACCOUNTING_METHOD.getRoute(policyID))}
                    />
                </OfflineWithFeedback>
            )}
        </ConnectionLayout>
    );
}

export default QuickbooksDesktopAutoSyncPageBase;
