import useOnyx from '@hooks/useOnyx';
import useRootNavigationState from '@hooks/useRootNavigationState';
import useShouldShowRequire2FAPage from '@hooks/useShouldShowRequire2FAPage';
import useTrialPaymentReminder from '@hooks/useTrialPaymentReminder';

import {isModalNavigatorName} from '@libs/Navigation/helpers/isNavigatorName';
import {getDeepestFocusedScreen, isTwoFactorSetupScreen} from '@libs/Navigation/Navigation';

import navigateToSubscriptionPayment from '@pages/home/common/navigateToSubscriptionPayment';

import ONYXKEYS from '@src/ONYXKEYS';

import React, {useCallback, useState} from 'react';

import TrialPaymentReminderModal from './TrialPaymentReminderModal';

function TrialPaymentReminderModalManager() {
    const {isEligibleToShow, currentVariation, countdownTime, dismiss} = useTrialPaymentReminder();
    const [modal] = useOnyx(ONYXKEYS.MODAL);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const shouldShowRequire2FAPage = useShouldShowRequire2FAPage();

    const isModalNavigatorActive = useRootNavigationState((state) => isModalNavigatorName(state?.routes?.at(-1)?.name));
    // This manager renders from GlobalModals, outside NavigationContainer, so it cannot call useNavigation().
    const isIn2FASetupFlow = useRootNavigationState((state) => isTwoFactorSetupScreen(getDeepestFocusedScreen(state)?.name));

    const isOtherModalActive = !!modal?.isVisible || !!modal?.willAlertModalBecomeVisible || isModalNavigatorActive;
    // The required-2FA screen is a full-screen overlay, not a modal, so isOtherModalActive never sees it.
    // Kept separate from that guard: this reminder's own BaseModal writes ONYXKEYS.MODAL.isVisible.
    const isRequired2FABlocking = shouldShowRequire2FAPage || isIn2FASetupFlow;

    if (isEligibleToShow && !isOtherModalActive && !isRequired2FABlocking && !isModalOpen) {
        setIsModalOpen(true);
    }
    // Unlatch without dismiss() so the reminder can still appear after required 2FA is completed.
    if ((!isEligibleToShow || isRequired2FABlocking) && isModalOpen) {
        setIsModalOpen(false);
    }

    const handleClose = useCallback(() => {
        setIsModalOpen(false);
        dismiss();
    }, [dismiss]);

    const handleAddPaymentCard = useCallback(() => {
        setIsModalOpen(false);
        dismiss();
        // Adding a payment card is web-only; on native this routes to the subscription page instead.
        navigateToSubscriptionPayment();
    }, [dismiss]);

    if (!currentVariation) {
        return null;
    }

    return (
        <TrialPaymentReminderModal
            isVisible={isModalOpen}
            variant={currentVariation.variant}
            daysRemaining={currentVariation.daysRemaining}
            countdownTime={countdownTime}
            onClose={handleClose}
            onAddPaymentCard={handleAddPaymentCard}
        />
    );
}

export default TrialPaymentReminderModalManager;
