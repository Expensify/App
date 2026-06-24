import React from 'react';
import type {SelectorType} from '@components/SelectionScreen';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import {updateXeroTravelInvoicingPayableAccount} from '@libs/actions/connections/Xero';
import {getLatestErrorField} from '@libs/ErrorUtils';
import {settingsPendingAction} from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import TravelInvoicingPayableAccountSelectPage from '@pages/workspace/accounting/common/TravelInvoicingPayableAccountSelectPage';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import {clearXeroErrorField} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import {DYNAMIC_ROUTES} from '@src/ROUTES';

function XeroTravelInvoicingPayableAccountSelectPage({policy}: WithPolicyConnectionsProps) {
    const {bankAccounts} = policy?.connections?.xero?.data ?? {};
    const config = policy?.connections?.xero?.config;

    const policyID = policy?.id ?? String(CONST.DEFAULT_NUMBER_ID);
    const selectedAccountID = config?.export?.travelInvoicingPayableAccountID;
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.POLICY_ACCOUNTING_XERO_TRAVEL_INVOICING_PAYABLE_ACCOUNT_SELECT.path);
    const data: Array<SelectorType<string>> =
        bankAccounts?.map((account) => ({
            value: account.id,
            text: account.name,
            keyForList: account.id,
            isSelected: account.id === selectedAccountID,
        })) ?? [];

    const selectAccount = (row: SelectorType<string>) => {
        if (row.value !== selectedAccountID) {
            updateXeroTravelInvoicingPayableAccount(policyID, row.value, selectedAccountID);
        }
        Navigation.goBack(backPath);
    };

    return (
        <TravelInvoicingPayableAccountSelectPage
            policyID={policyID}
            displayName="XeroTravelInvoicingPayableAccountSelectPage"
            data={data}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.XERO}
            emptyStateTitle="workspace.xero.noAccountsFound"
            emptyStateSubtitle="workspace.xero.noAccountsFoundDescription"
            onSelect={selectAccount}
            onBack={() => Navigation.goBack(backPath)}
            pendingAction={settingsPendingAction([CONST.XERO_CONFIG.TRAVEL_INVOICING_PAYABLE_ACCOUNT], config?.pendingFields)}
            errors={getLatestErrorField(config, CONST.XERO_CONFIG.TRAVEL_INVOICING_PAYABLE_ACCOUNT)}
            onClose={() => clearXeroErrorField(policyID, CONST.XERO_CONFIG.TRAVEL_INVOICING_PAYABLE_ACCOUNT)}
        />
    );
}

export default withPolicyConnections(XeroTravelInvoicingPayableAccountSelectPage);
