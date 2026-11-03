import type {SelectorType} from '@components/SelectionScreen';

import useLocalize from '@hooks/useLocalize';

import {updateQuickbooksOnlineTravelBillingPayableAccount} from '@libs/actions/connections/QuickbooksOnline';
import {getLatestErrorField} from '@libs/ErrorUtils';
import {settingsPendingAction} from '@libs/PolicyUtils';

import Navigation from '@navigation/Navigation';

import TravelBillingPayableAccountSelectPage from '@pages/workspace/accounting/common/TravelBillingPayableAccountSelectPage';
import {getQuickbooksOnlineIntegrationName} from '@pages/workspace/accounting/utils';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';

import {clearQBOErrorField} from '@userActions/Policy/Policy';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import React from 'react';

function QuickbooksExportTravelPayableAccountSelectPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const integrationName = getQuickbooksOnlineIntegrationName(policy, translate);
    const {creditCards} = policy?.connections?.quickbooksOnline?.data ?? {};
    const qboConfig = policy?.connections?.quickbooksOnline?.config;

    const policyID = policy?.id ?? String(CONST.DEFAULT_NUMBER_ID);
    const backPath = ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_TRAVEL_BILLING_CONFIGURATION.getRoute(policyID);
    const data: Array<SelectorType<string>> =
        creditCards?.map((account) => ({
            value: account.id,
            text: account.name,
            keyForList: account.name,
            isSelected: account.id === qboConfig?.travelInvoicingPayableAccountID,
        })) ?? [];

    const selectAccount = (row: SelectorType<string>) => {
        if (row.value !== qboConfig?.travelInvoicingPayableAccountID) {
            updateQuickbooksOnlineTravelBillingPayableAccount(policyID, row.value, qboConfig?.travelInvoicingPayableAccountID);
        }
        Navigation.goBack(backPath);
    };

    return (
        <TravelBillingPayableAccountSelectPage
            policyID={policyID}
            displayName="QuickbooksExportTravelPayableAccountSelectPage"
            data={data}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.QBO}
            emptyStateTitle="workspace.qbo.noAccountsFound"
            emptyStateSubtitle="workspace.qbo.noAccountsFoundDescription"
            emptyStateSubtitleAlreadyTranslated={translate('workspace.qbo.noAccountsFoundDescription', integrationName)}
            onSelect={selectAccount}
            onBack={() => Navigation.goBack(backPath)}
            pendingAction={settingsPendingAction([CONST.QUICKBOOKS_CONFIG.TRAVEL_BILLING_PAYABLE_ACCOUNT], qboConfig?.pendingFields)}
            errors={getLatestErrorField(qboConfig, CONST.QUICKBOOKS_CONFIG.TRAVEL_BILLING_PAYABLE_ACCOUNT)}
            onClose={() => clearQBOErrorField(policyID, CONST.QUICKBOOKS_CONFIG.TRAVEL_BILLING_PAYABLE_ACCOUNT)}
        />
    );
}

export default withPolicyConnections(QuickbooksExportTravelPayableAccountSelectPage);
