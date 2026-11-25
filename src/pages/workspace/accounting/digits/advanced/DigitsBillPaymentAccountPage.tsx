/**
 * Lets an admin choose the Digits bank account that pays the vendor bills of reports reimbursed in Expensify. Until one
 * is picked, the sync uses the first active bank account, or the first bank account when none is active.
 */
import {updateDigitsBillPaymentAccount} from '@libs/actions/connections/Digits';

import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';

import CONST from '@src/CONST';

import React from 'react';

import DigitsBankAccountSelectPage from './DigitsBankAccountSelectPage';

function DigitsBillPaymentAccountPage({policy}: WithPolicyConnectionsProps) {
    const syncReimbursedReports = policy?.connections?.digits?.config?.sync?.syncReimbursedReports ?? true;

    return (
        <DigitsBankAccountSelectPage
            policy={policy}
            settingName={CONST.DIGITS_CONFIG.BILL_PAYMENT_ACCOUNT_ID}
            title="workspace.digits.billPaymentAccount.label"
            description="workspace.digits.billPaymentAccount.description"
            displayName="DigitsBillPaymentAccountPage"
            shouldBeBlocked={!syncReimbursedReports}
            onSelectAccount={updateDigitsBillPaymentAccount}
        />
    );
}

export default withPolicyConnections(DigitsBillPaymentAccountPage);
