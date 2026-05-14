import React from 'react';
import type {SelectorType} from '@components/SelectionScreen';
import {updateConnectionConfig} from '@libs/actions/PolicyConnections';
import {getLatestErrorField} from '@libs/ErrorUtils';
import {settingsPendingAction} from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import TravelInvoicingPayableAccountSelectPage from '@pages/workspace/accounting/common/TravelInvoicingPayableAccountSelectPage';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import {clearQBOErrorField} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

function QuickbooksExportTravelPayableAccountSelectPage({policy}: WithPolicyConnectionsProps) {
    const {accountPayable} = policy?.connections?.quickbooksOnline?.data ?? {};
    const qboConfig = policy?.connections?.quickbooksOnline?.config;

    const policyID = policy?.id ?? String(CONST.DEFAULT_NUMBER_ID);
    const backPath = ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_TRAVEL_INVOICING_CONFIGURATION.getRoute(policyID);
    const data: Array<SelectorType<string>> =
        accountPayable?.map((account) => ({
            value: account.id,
            text: account.name,
            keyForList: account.name,
            isSelected: account.id === qboConfig?.travelInvoicingPayableAccountID,
        })) ?? [];

    const selectAccount = (row: SelectorType<string>) => {
        if (row.value !== qboConfig?.travelInvoicingPayableAccountID) {
            updateConnectionConfig(
                policyID,
                CONST.POLICY.CONNECTIONS.NAME.QBO,
                {travelInvoicingPayableAccountID: row.value},
                {travelInvoicingPayableAccountID: qboConfig?.travelInvoicingPayableAccountID},
            );
        }
        Navigation.goBack(backPath);
    };

    return (
        <TravelInvoicingPayableAccountSelectPage
            policyID={policyID}
            displayName="QuickbooksExportTravelPayableAccountSelectPage"
            data={data}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.QBO}
            emptyStateTitle="workspace.qbo.noAccountsFound"
            emptyStateSubtitle="workspace.qbo.noAccountsFoundDescription"
            onSelect={selectAccount}
            onBack={() => Navigation.goBack(backPath)}
            pendingAction={settingsPendingAction([CONST.QUICKBOOKS_CONFIG.TRAVEL_INVOICING_PAYABLE_ACCOUNT], qboConfig?.pendingFields)}
            errors={getLatestErrorField(qboConfig, CONST.QUICKBOOKS_CONFIG.TRAVEL_INVOICING_PAYABLE_ACCOUNT)}
            onClose={() => clearQBOErrorField(policyID, CONST.QUICKBOOKS_CONFIG.TRAVEL_INVOICING_PAYABLE_ACCOUNT)}
        />
    );
}

export default withPolicyConnections(QuickbooksExportTravelPayableAccountSelectPage);
