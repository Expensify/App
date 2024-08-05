import React, {useMemo} from 'react';
import ConnectionLayout from '@components/ConnectionLayout';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {getCurrentSageIntacctEntityName} from '@libs/PolicyUtils';
import * as PolicyUtils from '@libs/PolicyUtils';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

function SageIntacctExportPage({policy}: WithPolicyProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id ?? '-1';

    const {export: exportConfig, pendingFields, errorFields} = policy?.connections?.intacct?.config ?? {};

    const sections = useMemo(
        () => [
            {
                description: translate('workspace.sageIntacct.preferredExporter'),
                action: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_PREFERRED_EXPORTER.getRoute(policyID)),
                title: exportConfig?.exporter ?? translate('workspace.sageIntacct.notConfigured'),
                subscribedSettings: [CONST.SAGE_INTACCT_CONFIG.EXPORTER],
            },
            {
                description: translate('workspace.sageIntacct.exportDate.label'),
                action: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_EXPORT_DATE.getRoute(policyID)),
                title: exportConfig?.exportDate ? translate(`workspace.sageIntacct.exportDate.values.${exportConfig.exportDate}.label`) : translate(`workspace.sageIntacct.notConfigured`),
                subscribedSettings: [CONST.SAGE_INTACCT_CONFIG.EXPORT_DATE],
            },
            {
                description: translate('workspace.accounting.exportOutOfPocket'),
                action: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_REIMBURSABLE_EXPENSES.getRoute(policyID)),
                title: exportConfig?.reimbursable
                    ? translate(`workspace.sageIntacct.reimbursableExpenses.values.${exportConfig.reimbursable}`)
                    : translate('workspace.sageIntacct.notConfigured'),
                subscribedSettings: [CONST.SAGE_INTACCT_CONFIG.REIMBURSABLE, CONST.SAGE_INTACCT_CONFIG.REIMBURSABLE_VENDOR],
            },
            {
                description: translate('workspace.accounting.exportCompanyCard'),
                action: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_NON_REIMBURSABLE_EXPENSES.getRoute(policyID)),
                title: exportConfig?.nonReimbursable
                    ? translate(`workspace.sageIntacct.nonReimbursableExpenses.values.${exportConfig.nonReimbursable}`)
                    : translate('workspace.sageIntacct.notConfigured'),
                subscribedSettings: [
                    CONST.SAGE_INTACCT_CONFIG.NON_REIMBURSABLE,
                    CONST.SAGE_INTACCT_CONFIG.NON_REIMBURSABLE_ACCOUNT,
                    exportConfig?.nonReimbursable === CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL
                        ? CONST.SAGE_INTACCT_CONFIG.NON_REIMBURSABLE_VENDOR
                        : CONST.SAGE_INTACCT_CONFIG.NON_REIMBURSABLE_CREDIT_CARD_VENDOR,
                ],
            },
        ],
        [exportConfig, policyID, translate],
    );

    return (
        <ConnectionLayout
            displayName={SageIntacctExportPage.displayName}
            headerTitle="workspace.accounting.export"
            headerSubtitle={getCurrentSageIntacctEntityName(policy, translate('workspace.common.topLevel'))}
            title="workspace.sageIntacct.exportDescription"
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={styles.pb2}
            titleStyle={styles.ph5}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT}
        >
            {sections.map((section) => (
                <OfflineWithFeedback
                    key={section.description}
                    pendingAction={PolicyUtils.settingsPendingAction(section.subscribedSettings, pendingFields)}
                >
                    <MenuItemWithTopDescription
                        title={section.title}
                        description={section.description}
                        shouldShowRightIcon
                        onPress={section.action}
                        brickRoadIndicator={PolicyUtils.areSettingsInErrorFields(section.subscribedSettings, errorFields) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                    />
                </OfflineWithFeedback>
            ))}
        </ConnectionLayout>
    );
}

SageIntacctExportPage.displayName = 'SageIntacctExportPage';

export default withPolicyConnections(SageIntacctExportPage);
