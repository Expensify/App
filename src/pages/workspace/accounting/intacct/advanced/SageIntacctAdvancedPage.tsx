import React, {useMemo, useState} from 'react';
import ConnectionLayout from '@components/ConnectionLayout';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@navigation/Navigation';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import withPolicy from '@pages/workspace/withPolicy';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import {
    updateSageIntacctApprovalMode,
    updateSageIntacctAutoSync,
    updateSageIntacctImportEmployees,
    updateSageIntacctSyncReimbursedReports,
    updateSageIntacctSyncReimbursementAccountID,
} from '@userActions/connections/SageIntacct';
import * as Policy from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {SageIntacctDataElement} from '@src/types/onyx/Policy';

function getReimbursedAccountName(bankAccounts: SageIntacctDataElement[], reimbursementAccountID?: string): string | undefined {
    return bankAccounts.find((bankAccount) => bankAccount.id === reimbursementAccountID)?.name ?? reimbursementAccountID;
}

function SageIntacctAdvancedPage({policy}: WithPolicyProps) {
    const {translate} = useLocalize();
    const policyID = policy?.id ?? '-1';
    const styles = useThemeStyles();

    const {importEmployees, isAutoSyncEnabled, sync, pendingFields, credentials} = policy?.connections?.intacct?.config ?? {};
    const {data} = policy?.connections?.intacct ?? {};

    const [isSyncReimbursedReportsEnabled, setIsSyncReimbursedReportsEnabled] = useState(!!sync?.syncReimbursedReports);

    const currentSageIntacctOrganizationName = credentials?.companyID;

    const toggleSections = useMemo(
        () => [
            {
                label: translate('workspace.sageIntacct.autoSync'),
                onToggle: (enabled: boolean) => {
                    updateSageIntacctAutoSync(policyID, enabled);
                    // Connections.updatePolicyConnectionConfig(policyID, CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT, 'autoSync', enabled);
                },
                pendingAction: pendingFields?.isAutoSyncEnabled,
                error: ErrorUtils.getLatestErrorField(sync ?? {}, CONST.SAGE_INTACCT_CONFIG.IS_AUTO_SYNC_ENABLED),
                onCloseError: () => Policy.clearSageIntacctErrorField(policyID, CONST.SAGE_INTACCT_CONFIG.IS_AUTO_SYNC_ENABLED),
                description: translate('workspace.sageIntacct.autoSyncDescription'),
                isActive: !!isAutoSyncEnabled,
            },
            {
                label: translate('workspace.sageIntacct.inviteEmployees'),
                onToggle: (enabled: boolean) => {
                    updateSageIntacctImportEmployees(policyID, enabled);
                    updateSageIntacctApprovalMode(policyID, enabled);
                },
                pendingAction: pendingFields?.importEmployees,
                error:
                    ErrorUtils.getLatestErrorField(sync ?? {}, CONST.SAGE_INTACCT_CONFIG.IMPORT_EMPLOYEES) ??
                    ErrorUtils.getLatestErrorField(sync ?? {}, CONST.SAGE_INTACCT_CONFIG.APPROVAL_MODE),
                onCloseError: () => {
                    Policy.clearSageIntacctErrorField(policyID, CONST.SAGE_INTACCT_CONFIG.IMPORT_EMPLOYEES);
                    Policy.clearSageIntacctErrorField(policyID, CONST.SAGE_INTACCT_CONFIG.APPROVAL_MODE);
                },
                description: translate('workspace.sageIntacct.inviteEmployeesDescription'),
                isActive: !!importEmployees,
            },
            {
                label: translate('workspace.sageIntacct.syncReimbursedReports'),
                onToggle: (enabled: boolean) => {
                    setIsSyncReimbursedReportsEnabled(enabled);
                    if (!enabled) {
                        updateSageIntacctSyncReimbursedReports(policyID, null);
                        updateSageIntacctSyncReimbursementAccountID(policyID, null);
                    }
                },
                pendingAction: sync?.pendingFields?.syncReimbursedReports,
                error: ErrorUtils.getLatestErrorField(sync ?? {}, CONST.SAGE_INTACCT_CONFIG.SYNC_REIMBURSED_REPORTS),
                onCloseError: () => {
                    Policy.clearSageIntacctSyncErrorField(policyID, CONST.SAGE_INTACCT_CONFIG.SYNC_REIMBURSED_REPORTS);
                },
                description: translate('workspace.sageIntacct.syncReimbursedReportsDescription'),
                isActive: isSyncReimbursedReportsEnabled,
            },
        ],
        [translate, pendingFields?.isAutoSyncEnabled, pendingFields?.importEmployees, sync, isAutoSyncEnabled, importEmployees, isSyncReimbursedReportsEnabled, policyID],
    );

    return (
        <ConnectionLayout
            displayName={SageIntacctAdvancedPage.displayName}
            headerTitle="workspace.accounting.advanced"
            headerSubtitle={currentSageIntacctOrganizationName}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={styles.pb2}
            titleStyle={styles.ph5}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT}
        >
            {toggleSections.map((section) => (
                <ToggleSettingOptionRow
                    title={section.label}
                    subtitle={section.description}
                    shouldPlaceSubtitleBelowSwitch
                    switchAccessibilityLabel={section.label}
                    isActive={section.isActive}
                    onToggle={section.onToggle}
                    wrapperStyle={[styles.ph5, styles.pv5]}
                    pendingAction={section.pendingAction}
                    errors={section.error}
                    onCloseError={section.onCloseError}
                />
            ))}

            {isSyncReimbursedReportsEnabled && (
                <OfflineWithFeedback
                    key={translate('workspace.sageIntacct.paymentAccount')}
                    pendingAction={sync?.pendingFields?.reimbursementAccountID}
                >
                    <MenuItemWithTopDescription
                        title={getReimbursedAccountName(data?.bankAccounts ?? [], sync?.reimbursementAccountID) ?? translate('workspace.sageIntacct.notConfigured')}
                        description={translate('workspace.sageIntacct.paymentAccount')}
                        shouldShowRightIcon
                        onPress={() => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_PAYMENT_ACCOUNT.getRoute(policyID))}
                        brickRoadIndicator={sync?.errorFields?.reimbursementAccountID ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                    />
                </OfflineWithFeedback>
            )}
        </ConnectionLayout>
    );
}

SageIntacctAdvancedPage.displayName = 'PolicySageIntacctAdvancedPage';

export default withPolicy(SageIntacctAdvancedPage);
