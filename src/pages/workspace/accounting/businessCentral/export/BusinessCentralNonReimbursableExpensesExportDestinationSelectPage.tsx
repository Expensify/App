import type {ListItem} from '@components/SelectionList/types';
import SelectionScreen from '@components/SelectionScreen';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearBusinessCentralErrorField, updateBusinessCentralNonReimbursableExpensesExportDestination} from '@libs/actions/connections/BusinessCentral';
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
    value: BusinessCentralExport['nonReimbursable'];
};

function BusinessCentralNonReimbursableExpensesExportDestinationSelectPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id;
    const businessCentralConfig = policy?.connections?.businessCentral?.config;
    const nonReimbursable = businessCentralConfig?.export?.nonReimbursable ?? CONST.BUSINESS_CENTRAL_EXPORT_DESTINATION.PURCHASE_INVOICE;
    const backPath = policyID ? ROUTES.POLICY_ACCOUNTING_BUSINESS_CENTRAL_EXPORT.getRoute(policyID) : undefined;

    const data: DestinationListItem[] = Object.values(CONST.BUSINESS_CENTRAL_EXPORT_DESTINATION).map((destination) => ({
        value: destination,
        text: translate(`workspace.businessCentral.exportDestination.${destination}`),
        keyForList: destination,
        isSelected: nonReimbursable === destination,
    }));

    const selectDestination = (item: DestinationListItem) => {
        if (item.value !== nonReimbursable && policyID) {
            updateBusinessCentralNonReimbursableExpensesExportDestination(policyID, item.value, businessCentralConfig?.export?.nonReimbursable);
        }
        Navigation.goBack(backPath);
    };

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName="BusinessCentralNonReimbursableExpensesExportDestinationSelectPage"
            title="workspace.businessCentral.exportNonReimbursable"
            data={data}
            onSelectRow={selectDestination}
            shouldSingleExecuteRowSelect
            initiallyFocusedOptionKey={nonReimbursable}
            onBackButtonPress={() => Navigation.goBack(backPath)}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.BUSINESS_CENTRAL}
            pendingAction={settingsPendingAction([CONST.BUSINESS_CENTRAL_CONFIG.NON_REIMBURSABLE], businessCentralConfig?.pendingFields)}
            errors={getLatestErrorField(businessCentralConfig, CONST.BUSINESS_CENTRAL_CONFIG.NON_REIMBURSABLE)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => policyID && clearBusinessCentralErrorField(policyID, CONST.BUSINESS_CENTRAL_CONFIG.NON_REIMBURSABLE)}
        />
    );
}

export default withPolicyConnections(BusinessCentralNonReimbursableExpensesExportDestinationSelectPage);
