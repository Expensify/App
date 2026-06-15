import React from 'react';
import type {ListItem} from '@components/SelectionList/types';
import SelectionScreen from '@components/SelectionScreen';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {clearFinancialForceErrorField, updateFinancialForceReportExportStatus} from '@libs/actions/connections/FinancialForce';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {settingsPendingAction} from '@libs/PolicyUtils';
import {getCertiniaExportStatusValue} from '@pages/workspace/accounting/certinia/utils';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import CONST from '@src/CONST';
import {DYNAMIC_ROUTES} from '@src/ROUTES';

type FinancialForceReportExportStatus = typeof CONST.CERTINIA_EXPORT_STATUS.APPROVED | typeof CONST.CERTINIA_EXPORT_STATUS.SUBMITTED;

type ReportExportStatusListItem = ListItem & {
    value: FinancialForceReportExportStatus;
};

const REPORT_EXPORT_STATUSES: FinancialForceReportExportStatus[] = [CONST.CERTINIA_EXPORT_STATUS.APPROVED, CONST.CERTINIA_EXPORT_STATUS.SUBMITTED];

function CertiniaReportExportStatusPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id;
    const {config} = policy?.connections?.financialforce ?? {};
    const exportConfig = config?.export;
    const selectedReportExportStatus = exportConfig?.reportExportStatus;
    const normalizedSelectedReportExportStatus = getCertiniaExportStatusValue(selectedReportExportStatus);
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.POLICY_ACCOUNTING_CERTINIA_REPORT_EXPORT_STATUS.path);

    const data: ReportExportStatusListItem[] = REPORT_EXPORT_STATUSES.map((status) => ({
        value: status,
        text: translate(`workspace.certinia.reportExportStatus.values.${status}`),
        keyForList: status,
        isSelected: normalizedSelectedReportExportStatus === status,
    }));

    const selectReportExportStatus = (row: ReportExportStatusListItem) => {
        if (row.value !== normalizedSelectedReportExportStatus && policyID) {
            updateFinancialForceReportExportStatus(policyID, row.value, exportConfig?.reportExportStatus ?? null);
        }
        Navigation.goBack(backPath);
    };

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName="CertiniaReportExportStatusPage"
            data={data}
            onSelectRow={selectReportExportStatus}
            shouldSingleExecuteRowSelect
            initiallyFocusedOptionKey={normalizedSelectedReportExportStatus}
            onBackButtonPress={() => Navigation.goBack(backPath)}
            title="workspace.certinia.reportExportStatus.label"
            connectionName={CONST.POLICY.CONNECTIONS.NAME.CERTINIA}
            pendingAction={settingsPendingAction([CONST.CERTINIA_CONFIG.REPORT_EXPORT_STATUS], config?.pendingFields)}
            errors={getLatestErrorField(config, CONST.CERTINIA_CONFIG.REPORT_EXPORT_STATUS)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => clearFinancialForceErrorField(policyID, CONST.CERTINIA_CONFIG.REPORT_EXPORT_STATUS)}
        />
    );
}

CertiniaReportExportStatusPage.displayName = 'CertiniaReportExportStatusPage';

export default withPolicyConnections(CertiniaReportExportStatusPage);
