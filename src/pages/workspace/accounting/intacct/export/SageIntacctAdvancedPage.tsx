import React, {useMemo} from 'react';
import ConnectionLayout from '@components/ConnectionLayout';
import MenuItem from '@components/MenuItem';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import withPolicy, {WithPolicyProps} from '@pages/workspace/withPolicy';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import CONST from '@src/CONST';

function SageIntacctAdvancedPage({policy}: WithPolicyProps) {
    const {translate} = useLocalize();
    const policyID = policy?.id ?? '-1';
    const styles = useThemeStyles();

    const {syncReimbursedReports, reimbursementAccountID} = policy?.connections?.intacct?.config?.sync ?? {};
    const {autoSync, pendingFields, errorFields, credentials} = policy?.connections?.intacct?.config ?? {};

    const currentSageIntacctOrganizationName = credentials?.companyID;

    const toggleSections = useMemo(
        () => [
            {
                label: translate('workspace.sageIntacct.autoSync'),
                value: !!autoSync,
                onToggle: () => {},
                pendingAction: pendingFields?.autoSync,
                error: errorFields?.autoSync,
                description: translate('workspace.sageIntacct.autoSyncDescription'),
            },
            {
                label: translate('workspace.sageIntacct.inviteEmployees'),
                value: !!pendingFields?.importEmployees,
                onToggle: () => {},
                pendingAction: pendingFields?.importEmployees,
                error: errorFields?.importEmployees,
                description: translate('workspace.sageIntacct.inviteEmployeesDescription'),
            },
            {
                label: translate('workspace.sageIntacct.syncReimbursedReports'),
                value: !!syncReimbursedReports,
                onToggle: () => {},
                pendingAction: pendingFields?.sync?.syncReimbursedReports,
                error: errorFields?.sync?.syncReimbursedReports,
                description: translate('workspace.sageIntacct.syncReimbursedReportsDescription'),
            },
        ],
        [
            autoSync,
            errorFields?.autoSync,
            errorFields?.importEmployees,
            errorFields?.sync?.syncReimbursedReports,
            pendingFields?.autoSync,
            pendingFields?.importEmployees,
            pendingFields?.sync?.syncReimbursedReports,
            syncReimbursedReports,
            translate,
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
                        isActive={true}
                        onToggle={() => {}}
                        wrapperStyle={[styles.ph5, styles.pv5]}
                    />
                </OfflineWithFeedback>
            ))}

            <OfflineWithFeedback
                key={translate('workspace.sageIntacct.paymentAccount')}
                pendingAction={pendingFields?.sync?.reimbursementAccountID}
            >
                <MenuItem
                    title={reimbursementAccountID || translate('workspace.sageIntacct.notConfigured')}
                    description={translate('workspace.sageIntacct.paymentAccount')}
                    shouldShowRightIcon
                    onPress={() => {}}
                    brickRoadIndicator={errorFields?.reimbursementAccountID ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                />
            </OfflineWithFeedback>
        </ConnectionLayout>
    );
}

SageIntacctAdvancedPage.displayName = 'PolicySageIntacctAdvancedPage';

export default withPolicy(SageIntacctAdvancedPage);
