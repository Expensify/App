/**
 * Lets an admin choose the Digits bank account that Expensify Card settlements are paid from. Until one is picked, the
 * sync uses the first active bank account, or the first bank account when none is active.
 */
import useExpensifyCardFeeds from '@hooks/useExpensifyCardFeeds';

import {updateDigitsSettlementsAccount} from '@libs/actions/connections/Digits';
import {isExpensifyCardFullySetUp} from '@libs/CardUtils';

import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';

import CONST from '@src/CONST';

import React from 'react';

import DigitsBankAccountSelectPage from './DigitsBankAccountSelectPage';

function DigitsExpensifyCardSettlementAccountPage({policy}: WithPolicyConnectionsProps) {
    const allCardSettings = useExpensifyCardFeeds(policy?.id);
    const isExpensifyCardsEnabled = Object.values(allCardSettings ?? {})?.some((cardSetting) => isExpensifyCardFullySetUp(policy, cardSetting));
    const syncExpensifyCardSettlements = policy?.connections?.digits?.config?.sync?.syncExpensifyCardSettlements ?? true;

    return (
        <DigitsBankAccountSelectPage
            policy={policy}
            settingName={CONST.DIGITS_CONFIG.SETTLEMENTS_BANK_ACCOUNT_ID}
            title="workspace.digits.settlementAccount.label"
            description="workspace.digits.settlementAccount.description"
            displayName="DigitsExpensifyCardSettlementAccountPage"
            shouldBeBlocked={!isExpensifyCardsEnabled || !syncExpensifyCardSettlements}
            onSelectAccount={updateDigitsSettlementsAccount}
        />
    );
}

export default withPolicyConnections(DigitsExpensifyCardSettlementAccountPage);
