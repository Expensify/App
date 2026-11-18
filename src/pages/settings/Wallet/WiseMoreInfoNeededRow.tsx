import ConnectionStatusMessage from '@components/ConnectionStatusMessage';

import useLocalize from '@hooks/useLocalize';

import getWiseOnboardingStatusRoute from '@libs/Navigation/helpers/getWiseOnboardingStatusRoute';
import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';

import React from 'react';

/**
 * The Wallet bank account row's prompt for an account Wise asked for more info on, before it can enable global reimbursements.
 */
type WiseMoreInfoNeededRowProps = {
    bankAccountID: number;
};

/**
 * Prompts the admin under the Wallet bank account row to send Wise the info it asked for, so global reimbursements can be enabled.
 * It renders like the bank account's connection status message, so the prompts under one bank account look the same.
 */
function WiseMoreInfoNeededRow({bankAccountID}: WiseMoreInfoNeededRowProps) {
    const {translate} = useLocalize();

    return (
        <ConnectionStatusMessage
            message={translate('walletPage.wiseMoreInfoNeeded')}
            statusTone="success"
            actionText={translate('common.review')}
            onActionPress={() => Navigation.navigate(getWiseOnboardingStatusRoute(bankAccountID))}
            actionSentryLabel={CONST.SENTRY_LABEL.SETTINGS_WALLET.WISE_MORE_INFO_NEEDED_REVIEW}
        />
    );
}

export default WiseMoreInfoNeededRow;
