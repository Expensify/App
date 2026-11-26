import useConfirmModal from '@hooks/useConfirmModal';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import {doesUserHavePaymentCardAdded} from '@libs/SubscriptionUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {ValueOf} from 'type-fest';

/** Adding a payment card is only available on web, so without a card this explains why the action can't run. */
function useRunWithPaymentCard(flow: ValueOf<typeof CONST.DOMAIN.PAYMENT_CARD_FLOW>) {
    const [userBillingFundID] = useOnyx(ONYXKEYS.NVP_BILLING_FUND_ID);
    const {translate} = useLocalize();
    const {showConfirmModal} = useConfirmModal();
    const hasPaymentCard = doesUserHavePaymentCardAdded(userBillingFundID);

    return (action: () => void) => {
        if (hasPaymentCard) {
            action();
            return;
        }
        showConfirmModal({
            title: translate('workspace.distanceRates.oopsNotSoFast'),
            prompt: translate(
                flow === CONST.DOMAIN.PAYMENT_CARD_FLOW.PRIMARY_CONTACT ? 'domain.admins.primaryContactNoCardMobileMessage' : 'domain.admins.consolidatedBillingNoCardMobileMessage',
            ),
            confirmText: translate('common.buttonConfirm'),
            shouldShowCancelButton: false,
        });
    };
}

export default useRunWithPaymentCard;
