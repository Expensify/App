import React, {useMemo} from 'react';
import Accordion from '@components/Accordion';
import ConnectionLayout from '@components/ConnectionLayout';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import useAccordionAnimation from '@hooks/useAccordionAnimation';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {getLatestErrorField} from '@libs/ErrorUtils';
import {areSettingsInErrorFields, getCurrentSageIntacctEntityName, settingsPendingAction} from '@libs/PolicyUtils';
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
import {clearSageIntacctErrorField} from '@userActions/Policy/Policy';
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

    const {importEmployees, autoSync, sync, pendingFields, errorFields} = policy?.connections?.intacct?.config ?? {};
    const {data, config} = policy?.connections?.intacct ?? {};

    const {isAccordionExpanded, shouldAnimateAccordionSection} = useAccordionAnimation(!!sync?.syncReimbursedReports);

    const toggleSections = useMemo(
        () => [
            {
                label: translate('workspace.sageIntacct.autoSync'),
                description: translate('workspace.sageIntacct.autoSyncDescription'),
                isActive: !!autoSync?.enabled,
                onToggle: (enabled: boolean) => updateSageIntacctAutoSync(policyID, enabled),
                subscribedSettings: [CONST.SAGE_INTACCT_CONFIG.AUTO_SYNC_ENABLED],
                error: getLatestErrorField(config, CONST.SAGE_INTACCT_CONFIG.AUTO_SYNC_ENABLED),
                onCloseError: () => clearSageIntacctErrorField(policyID, CONST.SAGE_INTACCT_CONFIG.AUTO_SYNC_ENABLED),
            },
            {
                label: translate('workspace.sageIntacct.inviteEmployees'),
                description: translate('workspace.sageIntacct.inviteEmployeesDescription'),
                isActive: !!importEmployees,
                onToggle: (enabled: boolean) => {
                    updateSageIntacctImportEmployees(policyID, enabled);
                    updateSageIntacctApprovalMode(policyID, enabled);
                },
                subscribedSettings: [CONST.SAGE_INTACCT_CONFIG.IMPORT_EMPLOYEES, CONST.SAGE_INTACCT_CONFIG.APPROVAL_MODE],
                error: getLatestErrorField(config ?? {}, CONST.SAGE_INTACCT_CONFIG.IMPORT_EMPLOYEES) ?? getLatestErrorField(config ?? {}, CONST.SAGE_INTACCT_CONFIG.APPROVAL_MODE),
                onCloseError: () => {
                    clearSageIntacctErrorField(policyID, CONST.SAGE_INTACCT_CONFIG.IMPORT_EMPLOYEES);
                    clearSageIntacctErrorField(policyID, CONST.SAGE_INTACCT_CONFIG.APPROVAL_MODE);
                },
            },
            {
                label: translate('workspace.sageIntacct.syncReimbursedReports'),
                description: translate('workspace.sageIntacct.syncReimbursedReportsDescription'),
                isActive: !!sync?.syncReimbursedReports,
                onToggle: (enabled: boolean) => {
                    updateSageIntacctSyncReimbursedReports(policyID, enabled);

                    if (enabled && !sync?.reimbursementAccountID) {
                        const reimbursementAccountID = data?.bankAccounts[0]?.id ?? '';
                        updateSageIntacctSyncReimbursementAccountID(policyID, reimbursementAccountID);
                    }
                },
                subscribedSettings: [CONST.SAGE_INTACCT_CONFIG.SYNC_REIMBURSED_REPORTS],
                error: getLatestErrorField(config ?? {}, CONST.SAGE_INTACCT_CONFIG.SYNC_REIMBURSED_REPORTS),
                onCloseError: () => {
                    clearSageIntacctErrorField(policyID, CONST.SAGE_INTACCT_CONFIG.SYNC_REIMBURSED_REPORTS);
                },
            },
        ],
        [translate, autoSync?.enabled, config, importEmployees, sync?.syncReimbursedReports, sync?.reimbursementAccountID, policyID, data?.bankAccounts],
    );

    return (
        <ConnectionLayout
            displayName={SageIntacctAdvancedPage.displayName}
            headerTitle="workspace.accounting.advanced"
            headerSubtitle={getCurrentSageIntacctEntityName(policy, translate('workspace.common.topLevel'))}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={styles.pb2}
            titleStyle={styles.ph5}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT}
            onBackButtonPress={() => Navigation.goBack(ROUTES.POLICY_ACCOUNTING.getRoute(policyID))}
        >
            {toggleSections.map((section) => (
                <ToggleSettingOptionRow
                    key={section.label}
                    title={section.label}
                    subtitle={section.description}
                    shouldPlaceSubtitleBelowSwitch
                    switchAccessibilityLabel={section.label}
                    isActive={section.isActive}
                    onToggle={section.onToggle}
                    wrapperStyle={[styles.ph5, styles.pv3]}
                    pendingAction={settingsPendingAction(section.subscribedSettings, pendingFields)}
                    errors={section.error}
                    onCloseError={section.onCloseError}
                />
            ))}

            <Accordion
                isExpanded={isAccordionExpanded}
                style={styles.overflowHidden}
                isToggleTriggered={shouldAnimateAccordionSection}
            >
                <OfflineWithFeedback
                    key={translate('workspace.sageIntacct.paymentAccount')}
                    pendingAction={settingsPendingAction([CONST.SAGE_INTACCT_CONFIG.REIMBURSEMENT_ACCOUNT_ID], pendingFields)}
                >
                    <MenuItemWithTopDescription
                        title={getReimbursedAccountName(data?.bankAccounts ?? [], sync?.reimbursementAccountID) ?? translate('workspace.sageIntacct.notConfigured')}
                        description={translate('workspace.sageIntacct.paymentAccount')}
                        shouldShowRightIcon
                        onPress={() => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_PAYMENT_ACCOUNT.getRoute(policyID))}
                        brickRoadIndicator={areSettingsInErrorFields([CONST.SAGE_INTACCT_CONFIG.REIMBURSEMENT_ACCOUNT_ID], errorFields) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                    />
                </OfflineWithFeedback>
            </Accordion>
        </ConnectionLayout>
    );
}

SageIntacctAdvancedPage.displayName = 'SageIntacctAdvancedPage';

export default withPolicy(SageIntacctAdvancedPage);
