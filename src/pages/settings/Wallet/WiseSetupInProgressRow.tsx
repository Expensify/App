/** The line under a Wallet bank account whose Wise global reimbursements setup is not finished, with a button to where the admin can pick it up or follow it */
import ConnectionStatusMessage from '@components/ConnectionStatusMessage';

import useLocalize from '@hooks/useLocalize';
import useRunWhenOnline from '@hooks/useRunWhenOnline';

import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import getWiseOnboardingStatusRoute from '@libs/Navigation/helpers/getWiseOnboardingStatusRoute';
import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import {DYNAMIC_ROUTES} from '@src/ROUTES';

import React from 'react';

type WiseSetupInProgressRowProps = {
    bankAccountID: number;

    /** Whether Wise is reviewing the onboarding with nothing for the admin to do, so the row says it is in review instead of offering to continue it */
    isInReview: boolean;

    /** Whether the onboarding is already with Wise, so the row links to the status page instead of the intro */
    isOnboardingSubmitted: boolean;

    /** The bank account's name and description, so screen readers say which account the action is for */
    bankAccountLabel: string;
};

/**
 * Tells the admin under the Wallet bank account row that its global reimbursements setup is not finished.
 * It renders like the bank account's other status messages, so it reads as part of that account and not the next one.
 */
function WiseSetupInProgressRow({bankAccountID, isInReview, isOnboardingSubmitted, bankAccountLabel}: WiseSetupInProgressRowProps) {
    const {translate} = useLocalize();
    const runWhenOnline = useRunWhenOnline();
    // While the admin has something to do they continue the setup, and while Wise reviews it the admin can only check its status.
    const message = isInReview ? translate('walletPage.wiseSetupRow.inReview.message') : translate('walletPage.wiseSetupRow.inProgress.message');
    const actionText = isInReview ? translate('walletPage.wiseSetupRow.inReview.action') : translate('common.continue');

    // The status page shows what the device holds, so only the way into the onboarding form waits for a connection
    const openSetup = () => {
        if (isOnboardingSubmitted) {
            Navigation.navigate(getWiseOnboardingStatusRoute(bankAccountID));
            return;
        }
        runWhenOnline(() => Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.WISE_GLOBAL_REIMBURSEMENTS_INTRO.getRoute(bankAccountID))));
    };

    return (
        <ConnectionStatusMessage
            message={message}
            statusTone="pending"
            actionText={actionText}
            actionAccessibilityLabel={`${actionText} ${bankAccountLabel}`}
            onActionPress={openSetup}
            actionSentryLabel={CONST.SENTRY_LABEL.SETTINGS_WALLET.WISE_SETUP_IN_PROGRESS_CONTINUE_LINK}
        />
    );
}

export default WiseSetupInProgressRow;
