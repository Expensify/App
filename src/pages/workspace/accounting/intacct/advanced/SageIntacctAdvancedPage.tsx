import React, {useMemo} from 'react';
import ConnectionLayout from '@components/ConnectionLayout';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Connections from '@libs/actions/connections';
import Navigation from '@navigation/Navigation';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import withPolicy from '@pages/workspace/withPolicy';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import {updateSageIntacctApprovalMode, updateSageIntacctAutoSync, updateSageIntacctImportEmployees} from '@userActions/connections/SageIntacct';
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

    const {syncReimbursedReports, reimbursementAccountID} = policy?.connections?.intacct?.config?.sync ?? {};
    const {isAutoSyncEnabled, pendingFields, errorFields, credentials} = policy?.connections?.intacct?.config ?? {};
    const {data} = policy?.connections?.intacct ?? {};

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
                error: errorFields?.isAutoSyncEnabled,
                description: translate('workspace.sageIntacct.autoSyncDescription'),
                isActive: isAutoSyncEnabled ?? false,
            },
            {
                label: translate('workspace.sageIntacct.inviteEmployees'),
                onToggle: (enabled: boolean) => {
                    updateSageIntacctImportEmployees(policyID, enabled);
                    updateSageIntacctApprovalMode(policyID, enabled);
                },
                pendingAction: pendingFields?.importEmployees,
                error: errorFields?.importEmployees,
                description: translate('workspace.sageIntacct.inviteEmployeesDescription'),
                isActive: policy?.connections?.intacct?.config?.importEmployees ?? false,
            },
            {
                label: translate('workspace.sageIntacct.syncReimbursedReports'),
                onToggle: (enabled: boolean) => Connections.updatePolicyConnectionConfig(policyID, CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT, 'sync', {syncReimbursedReports: enabled}),
                pendingAction: pendingFields?.sync,
                error: errorFields?.sync?.syncReimbursedReports,
                description: translate('workspace.sageIntacct.syncReimbursedReportsDescription'),
                isActive: syncReimbursedReports ?? false,
            },
        ],
        [
            translate,
            pendingFields?.isAutoSyncEnabled,
            pendingFields?.importEmployees,
            pendingFields?.sync,
            errorFields?.isAutoSyncEnabled,
            errorFields?.importEmployees,
            errorFields?.sync?.syncReimbursedReports,
            isAutoSyncEnabled,
            policy?.connections?.intacct?.config?.importEmployees,
            syncReimbursedReports,
            policyID,
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
                <OfflineWithFeedback
                    key={section.label}
                    pendingAction={section.pendingAction}
                >
                    <ToggleSettingOptionRow
                        title={section.label}
                        subtitle={section.description}
                        shouldPlaceSubtitleBelowSwitch
                        switchAccessibilityLabel={section.label}
                        isActive={section.isActive}
                        onToggle={section.onToggle}
                        wrapperStyle={[styles.ph5, styles.pv5]}
                    />
                </OfflineWithFeedback>
            ))}

            {syncReimbursedReports && (
                <OfflineWithFeedback
                    key={translate('workspace.sageIntacct.paymentAccount')}
                    pendingAction={pendingFields?.sync}
                >
                    <MenuItemWithTopDescription
                        title={getReimbursedAccountName(data?.bankAccounts ?? [], reimbursementAccountID) ?? translate('workspace.sageIntacct.notConfigured')}
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
