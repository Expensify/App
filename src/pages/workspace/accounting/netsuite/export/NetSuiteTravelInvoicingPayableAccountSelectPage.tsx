import React from 'react';
import type {SelectorType} from '@components/SelectionScreen';
import {updateNetSuiteTravelInvoicingPayableAccount} from '@libs/actions/connections/NetSuiteCommands';
import {getLatestErrorField} from '@libs/ErrorUtils';
import {settingsPendingAction} from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import TravelInvoicingPayableAccountSelectPage from '@pages/workspace/accounting/common/TravelInvoicingPayableAccountSelectPage';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import {clearNetSuiteErrorField} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

function NetSuiteTravelInvoicingPayableAccountSelectPage({policy}: WithPolicyConnectionsProps) {
    const {payableList} = policy?.connections?.netsuite?.options?.data ?? {};
    const config = policy?.connections?.netsuite?.options?.config;

    const policyID = policy?.id ?? String(CONST.DEFAULT_NUMBER_ID);
    const backPath = ROUTES.POLICY_ACCOUNTING_NETSUITE_TRAVEL_INVOICING_CONFIGURATION.getRoute(policyID);
    const data: Array<SelectorType<string>> =
        payableList?.map((account) => ({
            value: account.id,
            text: account.name,
            keyForList: account.id,
            isSelected: account.id === config?.travelInvoicingPayableAccountID,
        })) ?? [];

    const selectAccount = (row: SelectorType<string>) => {
        if (row.value !== config?.travelInvoicingPayableAccountID) {
            updateNetSuiteTravelInvoicingPayableAccount(policyID, row.value, config?.travelInvoicingPayableAccountID);
        }
        Navigation.goBack(backPath);
    };

    return (
        <TravelInvoicingPayableAccountSelectPage
            policyID={policyID}
            displayName="NetSuiteTravelInvoicingPayableAccountSelectPage"
            data={data}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.NETSUITE}
            emptyStateTitle="workspace.netsuite.noAccountsFound"
            emptyStateSubtitle="workspace.netsuite.noAccountsFoundDescription"
            onSelect={selectAccount}
            onBack={() => Navigation.goBack(backPath)}
            pendingAction={settingsPendingAction([CONST.NETSUITE_CONFIG.TRAVEL_INVOICING_PAYABLE_ACCOUNT], config?.pendingFields)}
            errors={getLatestErrorField(config, CONST.NETSUITE_CONFIG.TRAVEL_INVOICING_PAYABLE_ACCOUNT)}
            onClose={() => clearNetSuiteErrorField(policyID, CONST.NETSUITE_CONFIG.TRAVEL_INVOICING_PAYABLE_ACCOUNT)}
        />
    );
}

export default withPolicyConnections(NetSuiteTravelInvoicingPayableAccountSelectPage);
