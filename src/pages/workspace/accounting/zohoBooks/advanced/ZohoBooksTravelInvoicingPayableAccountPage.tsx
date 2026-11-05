/**
 * Lets an admin pick the workspace-level Zoho Books liability account that Consolidated Travel Billing amounts owed are recorded in.
 * It lists active credit card and other current liability accounts.
 */
import type {SelectorType} from '@components/SelectionScreen';

import useOnyx from '@hooks/useOnyx';
import useTravelBillingFundID from '@hooks/useTravelBillingFundID';

import {clearZohoBooksErrorField, updateZohoBooksTravelBillingPayableAccount} from '@libs/actions/connections/ZohoBooks';
import {getCardSettings} from '@libs/CardUtils';
import {getLatestErrorField} from '@libs/ErrorUtils';
import {settingsPendingAction} from '@libs/PolicyUtils';
import {getIsTravelBillingEnabled, getTravelBillingCardSettingsKey} from '@libs/TravelBillingUtils';

import Navigation from '@navigation/Navigation';

import TravelBillingPayableAccountSelectPage from '@pages/workspace/accounting/common/TravelBillingPayableAccountSelectPage';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import React from 'react';

function ZohoBooksTravelInvoicingPayableAccountPage({policy}: WithPolicyConnectionsProps) {
    const policyID = policy?.id ?? String(CONST.DEFAULT_NUMBER_ID);
    const zohoBooksConfig = policy?.connections?.zohoBooks?.config;
    const zohoBooksData = policy?.connections?.zohoBooks?.data;
    const travelInvoicingPayableAccountID = zohoBooksConfig?.export?.travelInvoicingPayableAccountID;
    const backPath = policyID ? ROUTES.POLICY_ACCOUNTING_ZOHO_BOOKS_ADVANCED.getRoute(policyID) : undefined;

    const travelBillingFundID = useTravelBillingFundID(policyID);
    const [cardSettings] = useOnyx(getTravelBillingCardSettingsKey(travelBillingFundID));
    const travelSettings = getCardSettings(cardSettings, CONST.TRAVEL.PROGRAM_TRAVEL_US);
    const isTravelBillingEnabled = getIsTravelBillingEnabled(travelSettings);
    const syncTravelInvoicingSettlements = zohoBooksConfig?.sync?.syncTravelInvoicingSettlements ?? true;
    const shouldBeBlocked = !isTravelBillingEnabled || !syncTravelInvoicingSettlements;

    const data: Array<SelectorType<string>> =
        zohoBooksData?.accounts
            ?.filter(
                (accountItem) =>
                    accountItem.isActive &&
                    (accountItem.accountType === CONST.ZOHO_BOOKS_ACCOUNT_TYPE.CREDIT_CARD || accountItem.accountType === CONST.ZOHO_BOOKS_ACCOUNT_TYPE.OTHER_CURRENT_LIABILITY),
            )
            .map((accountItem) => ({
                value: accountItem.id,
                text: accountItem.name,
                keyForList: accountItem.id,
                isSelected: travelInvoicingPayableAccountID === accountItem.id,
            })) ?? [];

    const setPayableAccount = (item: SelectorType<string>) => {
        if (item.value !== travelInvoicingPayableAccountID && policyID) {
            updateZohoBooksTravelBillingPayableAccount(policyID, item.value, travelInvoicingPayableAccountID);
        }
        Navigation.goBack(backPath);
    };

    return (
        <TravelBillingPayableAccountSelectPage
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            shouldBeBlocked={shouldBeBlocked}
            title="workspace.zohoBooks.travelBillingPayableAccount.label"
            displayName="ZohoBooksTravelInvoicingPayableAccountSelectPage"
            data={data}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.ZOHO_BOOKS}
            emptyStateTitle="workspace.zohoBooks.noAccountsFound"
            emptyStateSubtitle="workspace.zohoBooks.noAccountsFoundDescription"
            onSelect={setPayableAccount}
            onBack={() => Navigation.goBack(backPath)}
            pendingAction={settingsPendingAction([CONST.ZOHO_BOOKS_CONFIG.TRAVEL_BILLING_PAYABLE_ACCOUNT_ID], zohoBooksConfig?.pendingFields)}
            errors={getLatestErrorField(zohoBooksConfig, CONST.ZOHO_BOOKS_CONFIG.TRAVEL_BILLING_PAYABLE_ACCOUNT_ID)}
            onClose={() => clearZohoBooksErrorField(policyID, CONST.ZOHO_BOOKS_CONFIG.TRAVEL_BILLING_PAYABLE_ACCOUNT_ID)}
        />
    );
}

export default withPolicyConnections(ZohoBooksTravelInvoicingPayableAccountPage);
