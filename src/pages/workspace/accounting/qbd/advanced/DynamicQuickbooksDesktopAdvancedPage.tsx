import ConnectionLayout from '@components/ConnectionLayout';
import MenuItem from '@components/MenuItem';
import MenuItemField from '@components/MenuItem/presets/MenuItemField';
import MenuItemSectionRoot from '@components/MenuItem/presets/MenuItemSectionRoot';
import OfflineWithFeedback from '@components/OfflineWithFeedback';

import useCanConfigureCurrencyConversionFees from '@hooks/useCanConfigureCurrencyConversionFees';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {updateQuickbooksDesktopShouldAutoCreateVendor} from '@libs/actions/connections/QuickbooksDesktop';
import {getLatestErrorField} from '@libs/ErrorUtils';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import {areSettingsInErrorFields, settingsPendingAction} from '@libs/PolicyUtils';

import {isQBDExportingOnPayment} from '@pages/workspace/accounting/qbd/utils';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';

import {clearQBDErrorField} from '@userActions/Policy/Policy';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';

import {CONST as COMMON_CONST} from 'expensify-common';
import React from 'react';

const fxExpenseAccountSettings = [CONST.QUICKBOOKS_DESKTOP_CONFIG.FX_EXPENSE_ACCOUNT];

function DynamicQuickbooksDesktopAdvancedPage({policy}: WithPolicyConnectionsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const canConfigureCurrencyConversionFees = useCanConfigureCurrencyConversionFees(policy);
    const policyID = policy?.id;
    const qbdConfig = policy?.connections?.quickbooksDesktop?.config;
    const {expenseAccounts} = policy?.connections?.quickbooksDesktop?.data ?? {};
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.WORKSPACE_ACCOUNTING_QUICKBOOKS_DESKTOP_ADVANCED.path);
    const accountingMethod = qbdConfig?.export?.accountingMethod ?? COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH;

    const selectedFxExpenseAccountName = expenseAccounts?.find(({id}) => id === qbdConfig?.fxExpenseAccount)?.name;

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
            displayName="DynamicQuickbooksDesktopAdvancedPage"
            headerTitle="workspace.accounting.advanced"
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={[styles.pb2, styles.ph5]}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.QBD}
            onBackButtonPress={() => Navigation.goBack(backPath)}
        >
            <OfflineWithFeedback pendingAction={settingsPendingAction([CONST.QUICKBOOKS_DESKTOP_CONFIG.AUTO_SYNC, CONST.QUICKBOOKS_CONFIG.ACCOUNTING_METHOD], qbdConfig?.pendingFields)}>
                <MenuItemSectionRoot onPress={() => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_AUTO_SYNC.getRoute(policyID))}>
                    <MenuItemField.Row
                        name={translate('workspace.accounting.autoSync')}
                        value={qbdConfig?.autoSync?.enabled ? translate('common.enabled') : translate('common.disabled')}
                    >
                        {areSettingsInErrorFields([CONST.QUICKBOOKS_DESKTOP_CONFIG.AUTO_SYNC, CONST.QUICKBOOKS_DESKTOP_CONFIG.ACCOUNTING_METHOD], qbdConfig?.errorFields) && (
                            <MenuItem.BrickRoadIndicator status={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR} />
                        )}
                        <MenuItem.Chevron />
                    </MenuItemField.Row>
                    {!!qbdConfig?.autoSync?.enabled && <MenuItem.HelpText message={translate(`workspace.qbd.accountingMethods.alternateText.${accountingMethod}` as TranslationPaths)} />}
                </MenuItemSectionRoot>
            </OfflineWithFeedback>
            {canConfigureCurrencyConversionFees && isQBDExportingOnPayment(qbdConfig) && (
                <OfflineWithFeedback
                    pendingAction={settingsPendingAction(fxExpenseAccountSettings, qbdConfig?.pendingFields)}
                    style={styles.mt3}
                >
                    <MenuItemSectionRoot onPress={() => Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_FX_EXPENSE_ACCOUNT_SELECT.path))}>
                        <MenuItemField.Row
                            name={translate('workspace.qbd.advancedConfig.fxExpenseAccount')}
                            value={selectedFxExpenseAccountName}
                        >
                            {areSettingsInErrorFields(fxExpenseAccountSettings, qbdConfig?.errorFields) && <MenuItem.BrickRoadIndicator status={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR} />}
                            <MenuItem.Chevron />
                        </MenuItemField.Row>
                    </MenuItemSectionRoot>
                </OfflineWithFeedback>
            )}
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
