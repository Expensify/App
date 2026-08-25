import type {SelectorType} from '@components/SelectionScreen';

import useDynamicBackPath from '@hooks/useDynamicBackPath';

import {updateQuickbooksDesktopTravelBillingPayableAccount} from '@libs/actions/connections/QuickbooksDesktop';
import {getLatestErrorField} from '@libs/ErrorUtils';
import {settingsPendingAction} from '@libs/PolicyUtils';

import Navigation from '@navigation/Navigation';

import TravelBillingPayableAccountSelectPage from '@pages/workspace/accounting/common/TravelBillingPayableAccountSelectPage';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';

import {clearQBDErrorField} from '@userActions/Policy/Policy';

import CONST from '@src/CONST';
import {DYNAMIC_ROUTES} from '@src/ROUTES';

import React from 'react';

function QuickbooksDesktopTravelBillingPayableAccountSelectPage({policy}: WithPolicyConnectionsProps) {
    const {payableAccounts} = policy?.connections?.quickbooksDesktop?.data ?? {};
    const qbdConfig = policy?.connections?.quickbooksDesktop?.config;
    const travelInvoicingPayableAccountID = qbdConfig?.export?.travelInvoicingPayableAccountID;

    const policyID = policy?.id ?? CONST.DEFAULT_NUMBER_ID.toString();
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_TRAVEL_BILLING_PAYABLE_ACCOUNT_SELECT.path);
    const data: Array<SelectorType<string>> =
        payableAccounts?.map((account) => ({
            value: account.id,
            text: account.name,
            keyForList: account.name,
            isSelected: account.id === travelInvoicingPayableAccountID,
        })) ?? [];

    const selectAccount = (row: SelectorType<string>) => {
        if (row.value !== travelInvoicingPayableAccountID) {
            updateQuickbooksDesktopTravelBillingPayableAccount(policyID, row.value, travelInvoicingPayableAccountID);
        }
        Navigation.goBack(backPath);
    };

    return (
        <TravelBillingPayableAccountSelectPage
            policyID={policyID}
            displayName="QuickbooksDesktopTravelBillingPayableAccountSelectPage"
            data={data}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.QBD}
            emptyStateTitle="workspace.qbd.noAccountsFound"
            emptyStateSubtitle="workspace.qbd.noAccountsFoundDescription"
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            onSelect={selectAccount}
            onBack={() => Navigation.goBack(backPath)}
            pendingAction={settingsPendingAction([CONST.QUICKBOOKS_DESKTOP_CONFIG.TRAVEL_BILLING_PAYABLE_ACCOUNT], qbdConfig?.pendingFields)}
            errors={getLatestErrorField(qbdConfig, CONST.QUICKBOOKS_DESKTOP_CONFIG.TRAVEL_BILLING_PAYABLE_ACCOUNT)}
            onClose={() => clearQBDErrorField(policyID, CONST.QUICKBOOKS_DESKTOP_CONFIG.TRAVEL_BILLING_PAYABLE_ACCOUNT)}
        />
    );
}

export default withPolicyConnections(QuickbooksDesktopTravelBillingPayableAccountSelectPage);
