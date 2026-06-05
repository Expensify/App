import React from 'react';
import type {ValueOf} from 'type-fest';
import type {ListItem} from '@components/SelectionList/types';
import SelectionScreen from '@components/SelectionScreen';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {clearFinancialForceErrorField, updateFinancialForceExportStatus} from '@libs/actions/connections/FinancialForce';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {settingsPendingAction} from '@libs/PolicyUtils';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import CONST from '@src/CONST';
import {DYNAMIC_ROUTES} from '@src/ROUTES';

type ExportStatusListItem = ListItem & {
    value: ValueOf<typeof CONST.CERTINIA_EXPORT_STATUS>;
};

const FFA_EXPORT_STATUSES: Array<ValueOf<typeof CONST.CERTINIA_EXPORT_STATUS>> = [CONST.CERTINIA_EXPORT_STATUS.APPROVED, CONST.CERTINIA_EXPORT_STATUS.IN_PROGRESS];

function CertiniaExportStatusPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id;
    const {config} = policy?.connections?.financialforce ?? {};
    const exportConfig = config?.export;
    const selectedExportStatus = exportConfig?.exportStatus;
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.POLICY_ACCOUNTING_CERTINIA_EXPORT_STATUS.path);

    const data: ExportStatusListItem[] = FFA_EXPORT_STATUSES.map((status) => ({
        value: status,
        text: translate(`workspace.certinia.exportStatus.values.${status}`),
        keyForList: status,
        isSelected: selectedExportStatus === status,
    }));

    const selectExportStatus = (row: ExportStatusListItem) => {
        if (row.value !== selectedExportStatus && policyID) {
            updateFinancialForceExportStatus(policyID, row.value, exportConfig?.exportStatus ?? null);
        }
        Navigation.goBack(backPath);
    };

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName="CertiniaExportStatusPage"
            data={data}
            onSelectRow={selectExportStatus}
            shouldSingleExecuteRowSelect
            initiallyFocusedOptionKey={selectedExportStatus}
            onBackButtonPress={() => Navigation.goBack(backPath)}
            title="workspace.certinia.exportStatus.label"
            connectionName={CONST.POLICY.CONNECTIONS.NAME.CERTINIA}
            pendingAction={settingsPendingAction([CONST.CERTINIA_CONFIG.EXPORT_STATUS], config?.pendingFields)}
            errors={getLatestErrorField(config, CONST.CERTINIA_CONFIG.EXPORT_STATUS)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => clearFinancialForceErrorField(policyID, CONST.CERTINIA_CONFIG.EXPORT_STATUS)}
        />
    );
}

export default withPolicyConnections(CertiniaExportStatusPage);
