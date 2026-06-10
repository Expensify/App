import React from 'react';
import type {SelectorType} from '@components/SelectionScreen';
import {clearQBOErrorField} from '@libs/actions/Policy/Policy';
import {updateConnectionConfig} from '@libs/actions/PolicyConnections';
import {getLatestErrorField} from '@libs/ErrorUtils';
import {settingsPendingAction} from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import TravelInvoicingVendorSelectPage from '@pages/workspace/accounting/common/TravelInvoicingVendorSelectPage';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

function QuickbooksExportTravelVendorSelectPage({policy}: WithPolicyConnectionsProps) {
    const {vendors} = policy?.connections?.quickbooksOnline?.data ?? {};
    const qboConfig = policy?.connections?.quickbooksOnline?.config;

    const policyID = policy?.id ?? String(CONST.DEFAULT_NUMBER_ID);
    const backPath = ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_TRAVEL_INVOICING_CONFIGURATION.getRoute(policyID);
    const data: Array<SelectorType<string>> =
        vendors?.map((vendor) => ({
            value: vendor.id,
            text: vendor.name,
            keyForList: vendor.name,
            isSelected: vendor.id === qboConfig?.travelInvoicingVendorID,
        })) ?? [];

    const selectVendor = (row: SelectorType<string>) => {
        if (row.value !== qboConfig?.travelInvoicingVendorID) {
            updateConnectionConfig(policyID, CONST.POLICY.CONNECTIONS.NAME.QBO, {travelInvoicingVendorID: row.value}, {travelInvoicingVendorID: qboConfig?.travelInvoicingVendorID});
        }
        Navigation.goBack(backPath);
    };

    return (
        <TravelInvoicingVendorSelectPage
            policyID={policyID}
            displayName="QuickbooksExportTravelVendorSelectPage"
            data={data}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.QBO}
            emptyStateTitle="workspace.qbo.noAccountsFound"
            emptyStateSubtitle="workspace.qbo.noAccountsFoundDescription"
            onSelect={selectVendor}
            onBack={() => Navigation.goBack(backPath)}
            pendingAction={settingsPendingAction([CONST.QUICKBOOKS_CONFIG.TRAVEL_INVOICING_VENDOR], qboConfig?.pendingFields)}
            errors={getLatestErrorField(qboConfig, CONST.QUICKBOOKS_CONFIG.TRAVEL_INVOICING_VENDOR)}
            onClose={() => clearQBOErrorField(policyID, CONST.QUICKBOOKS_CONFIG.TRAVEL_INVOICING_VENDOR)}
        />
    );
}

export default withPolicyConnections(QuickbooksExportTravelVendorSelectPage);
