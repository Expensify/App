/**
 * Lets an admin choose the Digits account that Consolidated Travel Billing charges are payable to. It has no default,
 * so the travel settlement sync waits until an admin picks one.
 */
import type {SelectorType} from '@components/SelectionScreen';

import useOnyx from '@hooks/useOnyx';
import useTravelBillingFundID from '@hooks/useTravelBillingFundID';

import {clearDigitsErrorField, updateDigitsTravelBillingPayableAccount} from '@libs/actions/connections/Digits';
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

import {getDigitsTravelBillingPayableAccounts} from './DigitsAdvancedAccountUtils';

function DigitsTravelBillingPayableAccountPage({policy}: WithPolicyConnectionsProps) {
    const policyID = policy?.id ?? String(CONST.DEFAULT_NUMBER_ID);
    const digitsConfig = policy?.connections?.digits?.config;
    const travelInvoicingPayableAccountID = digitsConfig?.export?.travelInvoicingPayableAccountID;
    const backPath = ROUTES.POLICY_ACCOUNTING_DIGITS_ADVANCED.getRoute(policyID);

    const travelBillingFundID = useTravelBillingFundID(policyID);
    const [cardSettings] = useOnyx(getTravelBillingCardSettingsKey(travelBillingFundID));
    const travelSettings = getCardSettings(cardSettings, CONST.TRAVEL.PROGRAM_TRAVEL_US);
    const isTravelBillingEnabled = getIsTravelBillingEnabled(travelSettings);
    const syncTravelInvoicingSettlements = digitsConfig?.sync?.syncTravelInvoicingSettlements ?? true;

    const data: Array<SelectorType<string>> = getDigitsTravelBillingPayableAccounts(policy).map((accountItem) => ({
        value: accountItem.id,
        text: accountItem.name,
        keyForList: accountItem.id,
        isSelected: travelInvoicingPayableAccountID === accountItem.id,
    }));

    const selectPayableAccount = (item: SelectorType<string>) => {
        if (item.value !== travelInvoicingPayableAccountID) {
            updateDigitsTravelBillingPayableAccount(policyID, item.value, travelInvoicingPayableAccountID);
        }
        Navigation.goBack(backPath);
    };

    return (
        <TravelBillingPayableAccountSelectPage
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            shouldBeBlocked={!isTravelBillingEnabled || !syncTravelInvoicingSettlements}
            title="workspace.digits.travelBillingPayableAccount.label"
            displayName="DigitsTravelBillingPayableAccountPage"
            data={data}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.DIGITS}
            emptyStateTitle="workspace.digits.noAccountsFound"
            emptyStateSubtitle="workspace.digits.noPayableAccountsFoundDescription"
            onSelect={selectPayableAccount}
            onBack={() => Navigation.goBack(backPath)}
            pendingAction={settingsPendingAction([CONST.DIGITS_CONFIG.TRAVEL_BILLING_PAYABLE_ACCOUNT_ID], digitsConfig?.pendingFields)}
            errors={getLatestErrorField(digitsConfig, CONST.DIGITS_CONFIG.TRAVEL_BILLING_PAYABLE_ACCOUNT_ID)}
            onClose={() => clearDigitsErrorField(policyID, CONST.DIGITS_CONFIG.TRAVEL_BILLING_PAYABLE_ACCOUNT_ID)}
        />
    );
}

export default withPolicyConnections(DigitsTravelBillingPayableAccountPage);
