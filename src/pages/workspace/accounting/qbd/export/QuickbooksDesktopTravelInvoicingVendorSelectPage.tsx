import React from 'react';
import type {SelectorType} from '@components/SelectionScreen';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import {updateQuickbooksDesktopTravelInvoicingVendor} from '@libs/actions/connections/QuickbooksDesktop';
import {getLatestErrorField} from '@libs/ErrorUtils';
import {settingsPendingAction} from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import TravelInvoicingVendorSelectPage from '@pages/workspace/accounting/common/TravelInvoicingVendorSelectPage';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import {clearQBDErrorField} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import {DYNAMIC_ROUTES} from '@src/ROUTES';

function QuickbooksDesktopTravelInvoicingVendorSelectPage({policy}: WithPolicyConnectionsProps) {
    const {vendors} = policy?.connections?.quickbooksDesktop?.data ?? {};
    const qbdConfig = policy?.connections?.quickbooksDesktop?.config;
    const travelInvoicingVendorID = qbdConfig?.export?.travelInvoicingVendorID;

    const policyID = policy?.id ?? CONST.DEFAULT_NUMBER_ID.toString();
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_TRAVEL_INVOICING_VENDOR_SELECT.path);
    const data: Array<SelectorType<string>> =
        vendors?.map((vendor) => ({
            value: vendor.id,
            text: vendor.name,
            keyForList: vendor.name,
            isSelected: vendor.id === travelInvoicingVendorID,
        })) ?? [];

    const selectVendor = (row: SelectorType<string>) => {
        if (row.value !== travelInvoicingVendorID) {
            updateQuickbooksDesktopTravelInvoicingVendor(policyID, row.value, travelInvoicingVendorID);
        }
        Navigation.goBack(backPath);
    };

    return (
        <TravelInvoicingVendorSelectPage
            policyID={policyID}
            displayName="QuickbooksDesktopTravelInvoicingVendorSelectPage"
            data={data}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.QBD}
            emptyStateTitle="workspace.qbd.noAccountsFound"
            emptyStateSubtitle="workspace.qbd.noAccountsFoundDescription"
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            onSelect={selectVendor}
            onBack={() => Navigation.goBack(backPath)}
            pendingAction={settingsPendingAction([CONST.QUICKBOOKS_DESKTOP_CONFIG.TRAVEL_INVOICING_VENDOR], qbdConfig?.pendingFields)}
            errors={getLatestErrorField(qbdConfig, CONST.QUICKBOOKS_DESKTOP_CONFIG.TRAVEL_INVOICING_VENDOR)}
            onClose={() => clearQBDErrorField(policyID, CONST.QUICKBOOKS_DESKTOP_CONFIG.TRAVEL_INVOICING_VENDOR)}
        />
    );
}

export default withPolicyConnections(QuickbooksDesktopTravelInvoicingVendorSelectPage);
