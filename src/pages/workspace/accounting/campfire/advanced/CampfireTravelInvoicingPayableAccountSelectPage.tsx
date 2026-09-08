import type {SelectorType} from '@components/SelectionScreen';

import useOnyx from '@hooks/useOnyx';
import useWorkspaceAccountID from '@hooks/useWorkspaceAccountID';

import {clearCampfireErrorField, updateCampfireTravelInvoicingPayableAccount} from '@libs/actions/connections/Campfire';
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

function CampfireTravelInvoicingPayableAccountSelectPage({policy}: WithPolicyConnectionsProps) {
    const policyID = policy?.id ?? String(CONST.DEFAULT_NUMBER_ID);
    const campfireConfig = policy?.connections?.campfire?.config;
    const campfireData = policy?.connections?.campfire?.data;
    const travelInvoicingPayableAccountID = campfireConfig?.export?.travelInvoicingPayableAccountID;
    const backPath = policyID ? ROUTES.POLICY_ACCOUNTING_CAMPFIRE_ADVANCED.getRoute(policyID) : undefined;

    const workspaceAccountID = useWorkspaceAccountID(policyID);
    const [cardSettings] = useOnyx(getTravelBillingCardSettingsKey(workspaceAccountID));
    const travelSettings = getCardSettings(cardSettings, CONST.TRAVEL.PROGRAM_TRAVEL_US);
    const isTravelBillingEnabled = getIsTravelBillingEnabled(travelSettings);
    const syncTravelInvoicingSettlements = campfireConfig?.sync?.syncTravelInvoicingSettlements ?? true;
    const shouldBeBlocked = !isTravelBillingEnabled || !syncTravelInvoicingSettlements;

    const data: Array<SelectorType<string>> =
        campfireData?.accounts
            ?.filter(
                (accountItem) =>
                    accountItem.isActive &&
                    (accountItem.accountSubtype === CONST.CAMPFIRE_ACCOUNT_SUBTYPE.CREDIT_CARD || accountItem.accountSubtype === CONST.CAMPFIRE_ACCOUNT_SUBTYPE.OTHER_CURRENT_LIABILITY),
            )
            .map((accountItem) => ({
                value: accountItem.id,
                text: `${accountItem.id} ${accountItem.name}`,
                keyForList: accountItem.id,
                isSelected: travelInvoicingPayableAccountID === accountItem.id,
            })) ?? [];

    const setPayableAccount = (item: SelectorType<string>) => {
        if (item.value !== travelInvoicingPayableAccountID && policyID) {
            updateCampfireTravelInvoicingPayableAccount(policyID, item.value, travelInvoicingPayableAccountID);
        }
        Navigation.goBack(backPath);
    };

    return (
        <TravelBillingPayableAccountSelectPage
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            shouldBeBlocked={shouldBeBlocked}
            title="workspace.campfire.travelInvoicingPayableAccount.label"
            displayName="CampfireTravelInvoicingPayableAccountSelectPage"
            data={data}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.CAMPFIRE}
            emptyStateTitle="workspace.campfire.noAccountsFound"
            emptyStateSubtitle="workspace.campfire.noAccountsFoundDescription"
            onSelect={setPayableAccount}
            onBack={() => Navigation.goBack(backPath)}
            pendingAction={settingsPendingAction([CONST.CAMPFIRE_CONFIG.TRAVEL_BILLING_PAYABLE_ACCOUNT_ID], campfireConfig?.pendingFields)}
            errors={getLatestErrorField(campfireConfig, CONST.CAMPFIRE_CONFIG.TRAVEL_BILLING_PAYABLE_ACCOUNT_ID)}
            onClose={() => clearCampfireErrorField(policyID, CONST.CAMPFIRE_CONFIG.TRAVEL_BILLING_PAYABLE_ACCOUNT_ID)}
        />
    );
}

export default withPolicyConnections(CampfireTravelInvoicingPayableAccountSelectPage);
