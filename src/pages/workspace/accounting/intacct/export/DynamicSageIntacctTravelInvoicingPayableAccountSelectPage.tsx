import React from 'react';
import type {SelectorType} from '@components/SelectionScreen';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import {updateSageIntacctTravelInvoicingPayableAccount} from '@libs/actions/connections/SageIntacct';
import {clearSageIntacctErrorField} from '@libs/actions/Policy/Policy';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getSageIntacctCreditCards, settingsPendingAction} from '@libs/PolicyUtils';
import TravelInvoicingPayableAccountSelectPage from '@pages/workspace/accounting/common/TravelInvoicingPayableAccountSelectPage';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import CONST from '@src/CONST';
import {DYNAMIC_ROUTES} from '@src/ROUTES';

function DynamicSageIntacctTravelInvoicingPayableAccountSelectPage({policy}: WithPolicyConnectionsProps) {
    const policyID = policy?.id ?? String(CONST.DEFAULT_NUMBER_ID);
    const config = policy?.connections?.intacct?.config;
    const selectedAccountID = config?.export?.travelInvoicingPayableAccountID;
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_TRAVEL_INVOICING_PAYABLE_ACCOUNT_SELECT.path);

    const data = getSageIntacctCreditCards(policy, selectedAccountID);

    const selectAccount = (row: SelectorType<string>) => {
        if (row.value !== selectedAccountID) {
            updateSageIntacctTravelInvoicingPayableAccount(policyID, row.value, selectedAccountID);
        }
        Navigation.goBack(backPath);
    };

    return (
        <TravelInvoicingPayableAccountSelectPage
            policyID={policyID}
            displayName="SageIntacctTravelInvoicingPayableAccountSelectPage"
            title="workspace.sageIntacct.creditCardAccount"
            data={data}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT}
            emptyStateTitle="workspace.sageIntacct.noAccountsFound"
            emptyStateSubtitle="workspace.sageIntacct.noAccountsFoundDescription"
            onSelect={selectAccount}
            onBack={() => Navigation.goBack(backPath)}
            pendingAction={settingsPendingAction([CONST.SAGE_INTACCT_CONFIG.TRAVEL_INVOICING_PAYABLE_ACCOUNT], config?.pendingFields)}
            errors={getLatestErrorField(config, CONST.SAGE_INTACCT_CONFIG.TRAVEL_INVOICING_PAYABLE_ACCOUNT)}
            onClose={() => clearSageIntacctErrorField(policyID, CONST.SAGE_INTACCT_CONFIG.TRAVEL_INVOICING_PAYABLE_ACCOUNT)}
        />
    );
}

export default withPolicyConnections(DynamicSageIntacctTravelInvoicingPayableAccountSelectPage);
