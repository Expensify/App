/**
 * Lets an admin choose the Digits bank account that Consolidated Travel Billing settlements are paid from. Until one is
 * picked, the sync uses the first active bank account, or the first bank account when none is active.
 */
import useOnyx from '@hooks/useOnyx';
import useTravelBillingFundID from '@hooks/useTravelBillingFundID';

import {updateDigitsTravelBillingSettlementsAccount} from '@libs/actions/connections/Digits';
import {getCardSettings} from '@libs/CardUtils';
import {getIsTravelBillingEnabled, getTravelBillingCardSettingsKey} from '@libs/TravelBillingUtils';

import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';

import CONST from '@src/CONST';

import React from 'react';

import DigitsBankAccountSelectPage from './DigitsBankAccountSelectPage';

function DigitsTravelBillingSettlementAccountPage({policy}: WithPolicyConnectionsProps) {
    const travelBillingFundID = useTravelBillingFundID(policy?.id);
    const [cardSettings] = useOnyx(getTravelBillingCardSettingsKey(travelBillingFundID));
    const travelSettings = getCardSettings(cardSettings, CONST.TRAVEL.PROGRAM_TRAVEL_US);
    const isTravelBillingEnabled = getIsTravelBillingEnabled(travelSettings);
    const syncTravelInvoicingSettlements = policy?.connections?.digits?.config?.sync?.syncTravelInvoicingSettlements ?? true;

    return (
        <DigitsBankAccountSelectPage
            policy={policy}
            settingName={CONST.DIGITS_CONFIG.TRAVEL_BILLING_SETTLEMENTS_BANK_ACCOUNT_ID}
            title="workspace.digits.travelBillingSettlementAccount.label"
            description="workspace.digits.travelBillingSettlementAccount.description"
            displayName="DigitsTravelBillingSettlementAccountPage"
            shouldBeBlocked={!isTravelBillingEnabled || !syncTravelInvoicingSettlements}
            onSelectAccount={updateDigitsTravelBillingSettlementsAccount}
        />
    );
}

export default withPolicyConnections(DigitsTravelBillingSettlementAccountPage);
