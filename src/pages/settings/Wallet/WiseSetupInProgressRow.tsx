/** The line under a Wallet bank account whose Wise global reimbursements setup is not finished, with Continue when the admin has something to do */
import ConnectionStatusMessage from '@components/ConnectionStatusMessage';

import useLocalize from '@hooks/useLocalize';

import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import getWiseOnboardingStatusRoute from '@libs/Navigation/helpers/getWiseOnboardingStatusRoute';
import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import {DYNAMIC_ROUTES} from '@src/ROUTES';

import React from 'react';

type WiseSetupInProgressRowProps = {
    bankAccountID: number;

    /** Whether the admin has something to do, which shows Continue to the intro that picks the setup up */
    canContinue: boolean;

    /** Whether the onboarding is already with Wise, so Continue opens the status page instead of the intro */
    isOnboardingSubmitted: boolean;

    /** The bank account's name and description, so screen readers say which account Continue is for */
    bankAccountLabel: string;
};

/**
 * Tells the admin under the Wallet bank account row that its global reimbursements setup is not finished.
 * It renders like the bank account's other status messages, so it reads as part of that account and not the next one.
 */
function WiseSetupInProgressRow({bankAccountID, canContinue, isOnboardingSubmitted, bankAccountLabel}: WiseSetupInProgressRowProps) {
    const {translate} = useLocalize();
    const continueText = translate('common.continue');

    return (
        <ConnectionStatusMessage
            message={translate('walletPage.wiseSetupInProgress.message')}
            statusTone="pending"
            actionText={canContinue ? continueText : undefined}
            actionAccessibilityLabel={`${continueText} ${bankAccountLabel}`}
            onActionPress={() =>
                isOnboardingSubmitted
                    ? Navigation.navigate(getWiseOnboardingStatusRoute(bankAccountID))
                    : Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.WISE_GLOBAL_REIMBURSEMENTS_INTRO.getRoute(bankAccountID)))
            }
            actionSentryLabel={CONST.SENTRY_LABEL.SETTINGS_WALLET.WISE_SETUP_IN_PROGRESS_CONTINUE_LINK}
        />
    );
}

export default WiseSetupInProgressRow;
