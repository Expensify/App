import useOnyx from '@hooks/useOnyx';
import useTrialPaymentReminder from '@hooks/useTrialPaymentReminder';

import navigateToSubscriptionPayment from '@pages/home/common/navigateToSubscriptionPayment';

import ONYXKEYS from '@src/ONYXKEYS';

import React, {useCallback, useState} from 'react';

import TrialPaymentReminderModal from './TrialPaymentReminderModal';

function TrialPaymentReminderModalManager() {
    const {isEligibleToShow, currentVariation, countdownTime, dismiss} = useTrialPaymentReminder();
    const [modal] = useOnyx(ONYXKEYS.MODAL);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const isOtherModalActive = !!modal?.isVisible || !!modal?.willAlertModalBecomeVisible;

    if (isEligibleToShow && !isOtherModalActive && !isModalOpen) {
        setIsModalOpen(true);
    }
    if (!isEligibleToShow && isModalOpen) {
        setIsModalOpen(false);
    }

    const handleClose = useCallback(() => {
        setIsModalOpen(false);
        dismiss();
    }, [dismiss]);

    const handleAddPaymentCard = useCallback(() => {
        setIsModalOpen(false);
        dismiss();
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
