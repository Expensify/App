import type {SelectorType} from '@components/SelectionScreen';

import useOnyx from '@hooks/useOnyx';
import useWorkspaceAccountID from '@hooks/useWorkspaceAccountID';

import {clearDualEntryErrorField, updateDualEntryTravelInvoicingPayableAccount} from '@libs/actions/connections/DualEntry';
import {getCardSettings} from '@libs/CardUtils';
import {getLatestErrorField} from '@libs/ErrorUtils';
import {settingsPendingAction} from '@libs/PolicyUtils';
import {getTravelBillingCardSettingsKey, getIsTravelBillingEnabled} from '@libs/TravelBillingUtils';

import Navigation from '@navigation/Navigation';

import TravelBillingPayableAccountSelectPage from '@pages/workspace/accounting/common/TravelBillingPayableAccountSelectPage';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import React from 'react';

function DualEntryTravelInvoicingPayableAccountSelectPage({policy}: WithPolicyConnectionsProps) {
    const policyID = policy?.id ?? String(CONST.DEFAULT_NUMBER_ID);
    const dualentryConfig = policy?.connections?.dualEntry?.config;
    const dualentryData = policy?.connections?.dualEntry?.data;
    const travelInvoicingPayableAccountID = dualentryConfig?.export?.travelInvoicingPayableAccountID;
    const backPath = policyID ? ROUTES.POLICY_ACCOUNTING_DUALENTRY_ADVANCED.getRoute(policyID) : undefined;

    const workspaceAccountID = useWorkspaceAccountID(policyID);
    const [cardSettings] = useOnyx(getTravelBillingCardSettingsKey(workspaceAccountID));
    const travelSettings = getCardSettings(cardSettings, CONST.TRAVEL.PROGRAM_TRAVEL_US);
    const isTravelBillingEnabled = getIsTravelBillingEnabled(travelSettings);
    const syncTravelInvoicingSettlements = dualentryConfig?.sync?.syncTravelInvoicingSettlements ?? true;
    const shouldBeBlocked = !isTravelBillingEnabled || !syncTravelInvoicingSettlements;

    const data: Array<SelectorType<string>> =
        dualentryData?.accounts
            ?.filter(
                (accountItem) =>
                    accountItem.isActive &&
                    (accountItem.accountType === CONST.DUALENTRY_ACCOUNT_TYPE.ACCOUNTS_PAYABLE ||
                        accountItem.accountType === CONST.DUALENTRY_ACCOUNT_TYPE.CREDIT_CARD ||
                        accountItem.accountType === CONST.DUALENTRY_ACCOUNT_TYPE.OTHER_CURRENT_LIABILITY),
            )
            .map((accountItem) => ({
                value: accountItem.id,
                text: `${accountItem.id} ${accountItem.name}`,
                keyForList: accountItem.id,
                isSelected: travelInvoicingPayableAccountID === accountItem.id,
            })) ?? [];

    const setPayableAccount = (item: SelectorType<string>) => {
        if (item.value !== travelInvoicingPayableAccountID && policyID) {
            updateDualEntryTravelInvoicingPayableAccount(policyID, item.value, travelInvoicingPayableAccountID);
        }
        Navigation.goBack(backPath);
    };

    return (
        <TravelBillingPayableAccountSelectPage
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            shouldBeBlocked={shouldBeBlocked}
            title="workspace.dualEntry.travelInvoicingPayableAccount.label"
            displayName="DualEntryTravelInvoicingPayableAccountSelectPage"
            data={data}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.DUALENTRY}
            emptyStateTitle="workspace.dualEntry.noAccountsFound"
            emptyStateSubtitle="workspace.dualEntry.noAccountsFoundDescription"
            onSelect={setPayableAccount}
            onBack={() => Navigation.goBack(backPath)}
            pendingAction={settingsPendingAction([CONST.DUALENTRY_CONFIG.TRAVEL_BILLING_PAYABLE_ACCOUNT_ID], dualentryConfig?.pendingFields)}
            errors={getLatestErrorField(dualentryConfig, CONST.DUALENTRY_CONFIG.TRAVEL_BILLING_PAYABLE_ACCOUNT_ID)}
            onClose={() => clearDualEntryErrorField(policyID, CONST.DUALENTRY_CONFIG.TRAVEL_BILLING_PAYABLE_ACCOUNT_ID)}
        />
    );
}

export default withPolicyConnections(DualEntryTravelInvoicingPayableAccountSelectPage);
