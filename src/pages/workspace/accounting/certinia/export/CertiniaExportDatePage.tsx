import React from 'react';
import type {ValueOf} from 'type-fest';
import type {ListItem} from '@components/SelectionList/types';
import SelectionScreen from '@components/SelectionScreen';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {clearFinancialForceErrorField, updateFinancialForceExportDate} from '@libs/actions/connections/FinancialForce';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {settingsPendingAction} from '@libs/PolicyUtils';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import CONST from '@src/CONST';
import {DYNAMIC_ROUTES} from '@src/ROUTES';

type ExportDateListItem = ListItem & {
    value: ValueOf<typeof CONST.CERTINIA_EXPORT_DATE>;
};

function CertiniaExportDatePage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id;
    const {config} = policy?.connections?.financialforce ?? {};
    const exportConfig = config?.export;
    const selectedExportDate = exportConfig?.exportDate;
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.POLICY_ACCOUNTING_CERTINIA_EXPORT_DATE.path);

    const data: ExportDateListItem[] = Object.values(CONST.CERTINIA_EXPORT_DATE).map((date) => ({
        value: date,
        text: translate(`workspace.certinia.exportDate.values.${date}`),
        keyForList: date,
        isSelected: selectedExportDate === date,
    }));

    const selectExportDate = (row: ExportDateListItem) => {
        if (row.value !== selectedExportDate && policyID) {
            updateFinancialForceExportDate(policyID, row.value, exportConfig?.exportDate ?? null);
        }
        Navigation.goBack(backPath);
    };

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName="CertiniaExportDatePage"
            data={data}
            onSelectRow={selectExportDate}
            shouldSingleExecuteRowSelect
            initiallyFocusedOptionKey={selectedExportDate}
            onBackButtonPress={() => Navigation.goBack(backPath)}
            title="workspace.certinia.exportDate.label"
            connectionName={CONST.POLICY.CONNECTIONS.NAME.CERTINIA}
            pendingAction={settingsPendingAction([CONST.CERTINIA_CONFIG.EXPORT_DATE], config?.pendingFields)}
            errors={getLatestErrorField(config, CONST.CERTINIA_CONFIG.EXPORT_DATE)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => clearFinancialForceErrorField(policyID, CONST.CERTINIA_CONFIG.EXPORT_DATE)}
        />
    );
}

export default withPolicyConnections(CertiniaExportDatePage);
