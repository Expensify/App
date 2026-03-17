import React, {useCallback} from 'react';
import useTrialPaymentReminder from '@hooks/useTrialPaymentReminder';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';
import TrialPaymentReminderModal from './TrialPaymentReminderModal';

function TrialPaymentReminderModalManager() {
    const {shouldShowModal, currentVariation, countdownTime, dismiss} = useTrialPaymentReminder();

    const handleClose = useCallback(() => {
        dismiss();
    }, [dismiss]);

    const handleAddPaymentCard = useCallback(() => {
        dismiss();
        Navigation.navigate(ROUTES.SETTINGS_SUBSCRIPTION_ADD_PAYMENT_CARD);
    }, [dismiss]);

    if (!currentVariation) {
        return null;
    }

    return (
        <TrialPaymentReminderModal
            isVisible={shouldShowModal}
            variant={currentVariation.variant}
            daysRemaining={currentVariation.daysRemaining}
            countdownTime={countdownTime}
            onClose={handleClose}
            onAddPaymentCard={handleAddPaymentCard}
        />
    );
}

export default TrialPaymentReminderModalManager;
