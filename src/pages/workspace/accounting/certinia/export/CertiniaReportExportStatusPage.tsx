import type {ListItem} from '@components/SelectionList/types';
import SelectionScreen from '@components/SelectionScreen';

import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearFinancialForceErrorField, updateFinancialForceReportExportStatus} from '@libs/actions/connections/FinancialForce';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {settingsPendingAction} from '@libs/PolicyUtils';

import {getCertiniaReportExportStatusValue} from '@pages/workspace/accounting/certinia/utils';
import type {CertiniaReportExportStatus} from '@pages/workspace/accounting/certinia/utils';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';

import CONST from '@src/CONST';
import {DYNAMIC_ROUTES} from '@src/ROUTES';

import React from 'react';

type ReportExportStatusListItem = ListItem & {
    value: CertiniaReportExportStatus;
};

const REPORT_EXPORT_STATUSES: CertiniaReportExportStatus[] = Object.values(CONST.CERTINIA_REPORT_EXPORT_STATUS);

function CertiniaReportExportStatusPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id;
    const {config} = policy?.connections?.financialforce ?? {};
    const exportConfig = config?.export;
    const selectedReportExportStatus = exportConfig?.exportStatus;
    const selectedReportExportStatusKey = getCertiniaReportExportStatusValue(selectedReportExportStatus);
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.POLICY_ACCOUNTING_CERTINIA_REPORT_EXPORT_STATUS.path);

    const data: ReportExportStatusListItem[] = REPORT_EXPORT_STATUSES.map((status) => ({
        value: status,
        text: translate(`workspace.certinia.reportExportStatus.values.${status}`),
        keyForList: status,
        isSelected: selectedReportExportStatusKey === status,
    }));

    const selectReportExportStatus = (row: ReportExportStatusListItem) => {
        if (row.value !== selectedReportExportStatusKey && policyID) {
            updateFinancialForceReportExportStatus(policyID, row.value, exportConfig?.exportStatus ?? null);
        }
        Navigation.goBack(backPath);
    };

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName="CertiniaReportExportStatusPage"
            shouldBeBlocked={!config?.hasPSA}
            data={data}
            onSelectRow={selectReportExportStatus}
            shouldSingleExecuteRowSelect
            initiallyFocusedOptionKey={selectedReportExportStatusKey}
            onBackButtonPress={() => Navigation.goBack(backPath)}
            title="workspace.certinia.reportExportStatus.label"
            connectionName={CONST.POLICY.CONNECTIONS.NAME.CERTINIA}
            pendingAction={settingsPendingAction([CONST.CERTINIA_CONFIG.EXPORT_STATUS], config?.pendingFields)}
            errors={getLatestErrorField(config, CONST.CERTINIA_CONFIG.EXPORT_STATUS)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => clearFinancialForceErrorField(policyID, CONST.CERTINIA_CONFIG.EXPORT_STATUS)}
        />
    );
}

CertiniaReportExportStatusPage.displayName = 'CertiniaReportExportStatusPage';

export default withPolicyConnections(CertiniaReportExportStatusPage);
