import type {ListItem} from '@components/SelectionList/types';
import SelectionScreen from '@components/SelectionScreen';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearBusinessCentralErrorField, updateBusinessCentralReimbursableExpensesExportDestination} from '@libs/actions/connections/BusinessCentral';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {settingsPendingAction} from '@libs/PolicyUtils';

import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {BusinessCentralExport} from '@src/types/onyx/Policy';

import React from 'react';

type DestinationListItem = ListItem & {
    value: BusinessCentralExport['reimbursable'];
};

function BusinessCentralReimbursableExpensesExportDestinationSelectPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id;
    const businessCentralConfig = policy?.connections?.businessCentral?.config;
    const reimbursable = businessCentralConfig?.export?.reimbursable ?? CONST.BUSINESS_CENTRAL_EXPORT_DESTINATION.JOURNAL_ENTRY;
    const backPath = policyID ? ROUTES.POLICY_ACCOUNTING_BUSINESS_CENTRAL_EXPORT.getRoute(policyID) : undefined;

    const data: DestinationListItem[] = Object.values(CONST.BUSINESS_CENTRAL_EXPORT_DESTINATION).map((destination) => ({
        value: destination,
        text: translate(`workspace.businessCentral.exportDestination.${destination}`),
        keyForList: destination,
        isSelected: reimbursable === destination,
    }));

    const selectDestination = (item: DestinationListItem) => {
        if (item.value !== reimbursable && policyID) {
            updateBusinessCentralReimbursableExpensesExportDestination(policyID, item.value, businessCentralConfig?.export?.reimbursable);
        }
        Navigation.goBack(backPath);
    };

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName="BusinessCentralReimbursableExpensesExportDestinationSelectPage"
            title="workspace.businessCentral.exportReimbursable"
            data={data}
            onSelectRow={selectDestination}
            shouldSingleExecuteRowSelect
            initiallyFocusedOptionKey={reimbursable}
            onBackButtonPress={() => Navigation.goBack(backPath)}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.BUSINESS_CENTRAL}
            pendingAction={settingsPendingAction([CONST.BUSINESS_CENTRAL_CONFIG.REIMBURSABLE], businessCentralConfig?.pendingFields)}
            errors={getLatestErrorField(businessCentralConfig, CONST.BUSINESS_CENTRAL_CONFIG.REIMBURSABLE)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => policyID && clearBusinessCentralErrorField(policyID, CONST.BUSINESS_CENTRAL_CONFIG.REIMBURSABLE)}
        />
    );
}

export default withPolicyConnections(BusinessCentralReimbursableExpensesExportDestinationSelectPage);
