import React, {useMemo} from 'react';
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

    const {importEmployees, autoSync, sync, pendingFields, errorFields, credentials} = policy?.connections?.intacct?.config ?? {};
    const {data, config} = policy?.connections?.intacct ?? {};

    const currentSageIntacctOrganizationName = credentials?.companyID;

    const toggleSections = useMemo(
        () => [
            {
                label: translate('workspace.sageIntacct.autoSync'),
                description: translate('workspace.sageIntacct.autoSyncDescription'),
                isActive: !!autoSync?.enabled,
                onToggle: (enabled: boolean) => updateSageIntacctAutoSync(policyID, enabled),
                pendingAction: pendingFields?.enabled,
                error: ErrorUtils.getLatestErrorField(config, CONST.SAGE_INTACCT_CONFIG.AUTO_SYNC_ENABLED),
                onCloseError: () => Policy.clearSageIntacctErrorField(policyID, CONST.SAGE_INTACCT_CONFIG.AUTO_SYNC_ENABLED),
            },
            {
                label: translate('workspace.sageIntacct.inviteEmployees'),
                description: translate('workspace.sageIntacct.inviteEmployeesDescription'),
                isActive: !!importEmployees,
                onToggle: (enabled: boolean) => {
                    updateSageIntacctImportEmployees(policyID, enabled);
                    updateSageIntacctApprovalMode(policyID, enabled);
                },
                pendingAction: pendingFields?.importEmployees,
                error:
                    ErrorUtils.getLatestErrorField(config ?? {}, CONST.SAGE_INTACCT_CONFIG.IMPORT_EMPLOYEES) ??
                    ErrorUtils.getLatestErrorField(config ?? {}, CONST.SAGE_INTACCT_CONFIG.APPROVAL_MODE),
                onCloseError: () => {
                    Policy.clearSageIntacctErrorField(policyID, CONST.SAGE_INTACCT_CONFIG.IMPORT_EMPLOYEES);
                    Policy.clearSageIntacctErrorField(policyID, CONST.SAGE_INTACCT_CONFIG.APPROVAL_MODE);
                },
            },
            {
                label: translate('workspace.sageIntacct.syncReimbursedReports'),
                description: translate('workspace.sageIntacct.syncReimbursedReportsDescription'),
                isActive: !!sync?.syncReimbursedReports,
                onToggle: (enabled: boolean) => {
                    if (!enabled) {
                        updateSageIntacctSyncReimbursedReports(policyID, false);
                    } else if (sync?.reimbursementAccountID !== undefined) {
                        updateSageIntacctSyncReimbursedReports(policyID, sync?.reimbursementAccountID);
                    } else {
                        const reimbursementAccountID = data?.bankAccounts[0]?.id ?? '-1';
                        updateSageIntacctSyncReimbursedReports(policyID, reimbursementAccountID);
                        updateSageIntacctSyncReimbursementAccountID(policyID, reimbursementAccountID);
                    }
                },
                pendingAction: pendingFields?.syncReimbursedReports,
                error: ErrorUtils.getLatestErrorField(config ?? {}, CONST.SAGE_INTACCT_CONFIG.SYNC_REIMBURSED_REPORTS),
                onCloseError: () => {
                    Policy.clearSageIntacctErrorField(policyID, CONST.SAGE_INTACCT_CONFIG.SYNC_REIMBURSED_REPORTS);
                },
            },
        ],
        [
            translate,
            autoSync?.enabled,
            pendingFields?.autoSync,
            pendingFields?.importEmployees,
            pendingFields?.syncReimbursedReports,
            config,
            importEmployees,
            sync?.syncReimbursedReports,
            sync?.reimbursementAccountID,
            policyID,
            data?.bankAccounts,
        ],
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

            {!!sync?.syncReimbursedReports && (
                <OfflineWithFeedback
                    key={translate('workspace.sageIntacct.paymentAccount')}
                    pendingAction={pendingFields?.reimbursementAccountID}
                >
                    <MenuItemWithTopDescription
                        title={getReimbursedAccountName(data?.bankAccounts ?? [], sync?.reimbursementAccountID) ?? translate('workspace.sageIntacct.notConfigured')}
                        description={translate('workspace.sageIntacct.paymentAccount')}
                        shouldShowRightIcon
                        onPress={() => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_PAYMENT_ACCOUNT.getRoute(policyID))}
                        brickRoadIndicator={errorFields?.reimbursementAccountID ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                    />
                </OfflineWithFeedback>
            )}
        </ConnectionLayout>
    );
}

SageIntacctAdvancedPage.displayName = 'PolicySageIntacctAdvancedPage';

export default withPolicy(SageIntacctAdvancedPage);
