import {CONST as COMMON_CONST} from 'expensify-common';
import React from 'react';
import ConnectionLayout from '@components/ConnectionLayout';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateQuickbooksDesktopShouldAutoCreateVendor} from '@libs/actions/connections/QuickbooksDesktop';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {areSettingsInErrorFields, settingsPendingAction} from '@libs/PolicyUtils';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import {clearQBDErrorField} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';

function DynamicQuickbooksDesktopAdvancedPage({policy}: WithPolicyConnectionsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const policyID = policy?.id;
    const qbdConfig = policy?.connections?.quickbooksDesktop?.config;
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.WORKSPACE_ACCOUNTING_QUICKBOOKS_DESKTOP_ADVANCED.path);
    const accountingMethod = qbdConfig?.export?.accountingMethod ?? COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH;

    const qbdToggleSettingItems = [
        {
            title: translate('workspace.qbd.advancedConfig.createEntities'),
            subtitle: translate('workspace.qbd.advancedConfig.createEntitiesDescription'),
            switchAccessibilityLabel: translate('workspace.qbd.advancedConfig.createEntitiesDescription'),
            isActive: !!qbdConfig?.shouldAutoCreateVendor,
            onToggle: (isOn: boolean) => {
                updateQuickbooksDesktopShouldAutoCreateVendor(policyID, isOn);
            },
            subscribedSetting: CONST.QUICKBOOKS_DESKTOP_CONFIG.SHOULD_AUTO_CREATE_VENDOR,
            errors: getLatestErrorField(qbdConfig, CONST.QUICKBOOKS_DESKTOP_CONFIG.SHOULD_AUTO_CREATE_VENDOR),
            pendingAction: settingsPendingAction([CONST.QUICKBOOKS_DESKTOP_CONFIG.SHOULD_AUTO_CREATE_VENDOR], qbdConfig?.pendingFields),
        },
    ];

    return (
        <ConnectionLayout
            displayName="QuickbooksDesktopAdvancedPage"
            headerTitle="workspace.accounting.advanced"
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={[styles.pb2, styles.ph5]}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.QBD}
            onBackButtonPress={() => Navigation.goBack(backPath)}
        >
            <OfflineWithFeedback pendingAction={settingsPendingAction([CONST.QUICKBOOKS_DESKTOP_CONFIG.AUTO_SYNC, CONST.QUICKBOOKS_CONFIG.ACCOUNTING_METHOD], qbdConfig?.pendingFields)}>
                <MenuItemWithTopDescription
                    title={qbdConfig?.autoSync?.enabled ? translate('common.enabled') : translate('common.disabled')}
                    description={translate('workspace.accounting.autoSync')}
                    shouldShowRightIcon
                    wrapperStyle={[styles.sectionMenuItemTopDescription]}
                    onPress={() => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_AUTO_SYNC.getRoute(policyID))}
                    brickRoadIndicator={
                        areSettingsInErrorFields([CONST.QUICKBOOKS_DESKTOP_CONFIG.AUTO_SYNC, CONST.QUICKBOOKS_DESKTOP_CONFIG.ACCOUNTING_METHOD], qbdConfig?.errorFields)
                            ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR
                            : undefined
                    }
                    hintText={(() => {
                        if (!qbdConfig?.autoSync?.enabled) {
                            return undefined;
                        }
                        return translate(`workspace.qbd.accountingMethods.alternateText.${accountingMethod}` as TranslationPaths);
                    })()}
                />
            </OfflineWithFeedback>

            {qbdToggleSettingItems.map((item) => (
                <ToggleSettingOptionRow
                    key={item.title}
                    title={item.title}
                    subtitle={item.subtitle}
                    switchAccessibilityLabel={item.switchAccessibilityLabel}
                    shouldPlaceSubtitleBelowSwitch
                    wrapperStyle={styles.mv3}
                    isActive={item.isActive}
                    onToggle={item.onToggle}
                    pendingAction={item.pendingAction}
                    errors={item.errors}
                    onCloseError={() => clearQBDErrorField(policyID, item.subscribedSetting)}
                />
            ))}
        </ConnectionLayout>
    );
}

export default withPolicyConnections(DynamicQuickbooksDesktopAdvancedPage);
