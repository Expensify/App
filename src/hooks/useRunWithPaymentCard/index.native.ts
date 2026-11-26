import useConfirmModal from '@hooks/useConfirmModal';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import {doesUserHavePaymentCardAdded} from '@libs/SubscriptionUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type RunWithPaymentCard from './types';
import type {PaymentCardFlow} from './types';

/** Adding a payment card is only available on web, so without a card this explains why the action can't run. */
function useRunWithPaymentCard(): RunWithPaymentCard {
    const [userBillingFundID] = useOnyx(ONYXKEYS.NVP_BILLING_FUND_ID);
    const {translate} = useLocalize();
    const {showConfirmModal} = useConfirmModal();
    const hasPaymentCard = doesUserHavePaymentCardAdded(userBillingFundID);

    const showNoPaymentCardModal = (flow: PaymentCardFlow) => {
        showConfirmModal({
            title: translate('workspace.distanceRates.oopsNotSoFast'),
            prompt: translate(
                flow === CONST.DOMAIN.PAYMENT_CARD_FLOW.PRIMARY_CONTACT ? 'domain.admins.primaryContactNoCardMobileMessage' : 'domain.admins.consolidatedBillingNoCardMobileMessage',
            ),
            confirmText: translate('common.buttonConfirm'),
            shouldShowCancelButton: false,
        });
    };

    return {
        hasPaymentCard,
        canAddPaymentCard: false,
        runWithPaymentCard: (flow, action) => {
            if (hasPaymentCard) {
                action();
                return;
            }
            showNoPaymentCardModal(flow);
        },
        showNoPaymentCardModal,
    };
}

export default useRunWithPaymentCard;
