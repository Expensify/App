import ConnectionLayout from '@components/ConnectionLayout';

import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {settingsPendingAction} from '@libs/PolicyUtils';

import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';

import {
    clearFinancialForceErrorField,
    updateFinancialForceAutoSync,
    updateFinancialForceExportForeignCurrency,
    updateFinancialForceSyncReimbursedReports,
    updateFinancialForceTaxNonBillable,
} from '@userActions/connections/FinancialForce';

import CONST from '@src/CONST';
import {DYNAMIC_ROUTES} from '@src/ROUTES';

import React from 'react';

function CertiniaAdvancedPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id;
    const config = policy?.connections?.financialforce?.config;
    const advancedConfig = config?.advanced;
    const isPSA = !!config?.hasPSA;
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.POLICY_ACCOUNTING_CERTINIA_ADVANCED.path);

    return (
        <ConnectionLayout
            displayName="CertiniaAdvancedPage"
            headerTitle="workspace.accounting.advanced"
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            onBackButtonPress={() => Navigation.goBack(backPath)}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={styles.pb2}
            titleStyle={styles.ph5}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.CERTINIA}
        >
            <ToggleSettingOptionRow
                title={translate('workspace.accounting.autoSync')}
                subtitle={translate('workspace.certinia.autoSyncDescription')}
                shouldPlaceSubtitleBelowSwitch
                switchAccessibilityLabel={translate('workspace.accounting.autoSync')}
                isActive={!!config?.autoSync?.enabled}
                onToggle={(enabled) => {
                    if (!policyID) {
                        return;
                    }
                    updateFinancialForceAutoSync(policyID, enabled, config?.autoSync?.enabled);
                }}
                wrapperStyle={[styles.ph5, styles.pv3]}
                pendingAction={settingsPendingAction([CONST.CERTINIA_CONFIG.AUTO_SYNC_ENABLED], config?.pendingFields)}
                errors={getLatestErrorField(config ?? {}, CONST.CERTINIA_CONFIG.AUTO_SYNC_ENABLED)}
                onCloseError={() => clearFinancialForceErrorField(policyID, CONST.CERTINIA_CONFIG.AUTO_SYNC_ENABLED)}
            />
            {isPSA ? (
                <>
                    <ToggleSettingOptionRow
                        title={translate('workspace.certinia.taxNonBillable')}
                        subtitle={translate('workspace.certinia.taxNonBillableDescription')}
                        shouldPlaceSubtitleBelowSwitch
                        switchAccessibilityLabel={translate('workspace.certinia.taxNonBillable')}
                        isActive={!!advancedConfig?.taxNonBillable}
                        onToggle={(enabled) => {
                            if (!policyID) {
                                return;
                            }
                            updateFinancialForceTaxNonBillable(policyID, enabled, advancedConfig?.taxNonBillable);
                        }}
                        wrapperStyle={[styles.ph5, styles.pv3]}
                        pendingAction={settingsPendingAction([CONST.CERTINIA_CONFIG.TAX_NON_BILLABLE], config?.pendingFields)}
                        errors={getLatestErrorField(config ?? {}, CONST.CERTINIA_CONFIG.TAX_NON_BILLABLE)}
                        onCloseError={() => clearFinancialForceErrorField(policyID, CONST.CERTINIA_CONFIG.TAX_NON_BILLABLE)}
                    />
                    <ToggleSettingOptionRow
                        title={translate('workspace.certinia.foreignCurrencyAmount')}
                        subtitle={translate('workspace.certinia.foreignCurrencyAmountDescription')}
                        shouldPlaceSubtitleBelowSwitch
                        switchAccessibilityLabel={translate('workspace.certinia.foreignCurrencyAmount')}
                        isActive={!!advancedConfig?.exportForeignCurrency}
                        onToggle={(enabled) => {
                            if (!policyID) {
                                return;
                            }
                            updateFinancialForceExportForeignCurrency(policyID, enabled, advancedConfig?.exportForeignCurrency);
                        }}
                        wrapperStyle={[styles.ph5, styles.pv3]}
                        pendingAction={settingsPendingAction([CONST.CERTINIA_CONFIG.EXPORT_FOREIGN_CURRENCY], config?.pendingFields)}
                        errors={getLatestErrorField(config ?? {}, CONST.CERTINIA_CONFIG.EXPORT_FOREIGN_CURRENCY)}
                        onCloseError={() => clearFinancialForceErrorField(policyID, CONST.CERTINIA_CONFIG.EXPORT_FOREIGN_CURRENCY)}
                    />
                </>
            ) : (
                <ToggleSettingOptionRow
                    title={translate('workspace.accounting.reimbursedReports')}
                    subtitle={translate('workspace.certinia.syncReimbursedReportsDescription')}
                    shouldPlaceSubtitleBelowSwitch
                    switchAccessibilityLabel={translate('workspace.accounting.reimbursedReports')}
                    isActive={!!advancedConfig?.syncReimbursedReports}
                    onToggle={(enabled) => {
                        if (!policyID) {
                            return;
                        }
                        updateFinancialForceSyncReimbursedReports(policyID, enabled, advancedConfig?.syncReimbursedReports);
                    }}
                    wrapperStyle={[styles.ph5, styles.pv3]}
                    pendingAction={settingsPendingAction([CONST.CERTINIA_CONFIG.SYNC_REIMBURSED_REPORTS], config?.pendingFields)}
                    errors={getLatestErrorField(config ?? {}, CONST.CERTINIA_CONFIG.SYNC_REIMBURSED_REPORTS)}
                    onCloseError={() => clearFinancialForceErrorField(policyID, CONST.CERTINIA_CONFIG.SYNC_REIMBURSED_REPORTS)}
                />
            )}
        </ConnectionLayout>
    );
}

export default withPolicyConnections(CertiniaAdvancedPage);
