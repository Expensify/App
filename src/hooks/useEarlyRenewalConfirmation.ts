import {ModalActions} from '@components/Modal/Global/ModalContext';

import {acceptEarlyRenewalOffer} from '@libs/actions/EarlyRenewalOffer';

import CONST from '@src/CONST';

import useConfirmModal from './useConfirmModal';
import useLocalize from './useLocalize';

/** Opens the confirmation modal for the non-incentivized early renewal offer. */
function useEarlyRenewalConfirmation() {
    const {showConfirmModal} = useConfirmModal();
    const {translate} = useLocalize();

    const showEarlyRenewalConfirmation = async () => {
        const copy = CONST.SUBSCRIPTION.EARLY_RENEWAL.COPY.BILLING_OWNER;
        const result = await showConfirmModal({
            title: copy.HEADER_TITLE,
            prompt: copy.CONFIRMATION_DESCRIPTION,
            confirmText: copy.CTA,
            cancelText: translate('common.cancel'),
            shouldDisableConfirmButtonWhenOffline: true,
            shouldEnableNewFocusManagement: true,
        });

        if (result.action !== ModalActions.CONFIRM) {
            return;
        }

        try {
            const response = await acceptEarlyRenewalOffer(CONST.SUBSCRIPTION.EARLY_RENEWAL.OFFER_ID.NON_INCENTIVIZED_ONE_YEAR);
            if (response?.jsonCode === CONST.JSON_CODE.SUCCESS) {
                return;
            }

            await showConfirmModal({
                title: copy.HEADER_TITLE,
                prompt: response?.message ?? translate('common.genericErrorMessage'),
                confirmText: translate('common.buttonConfirm'),
                shouldShowCancelButton: false,
                shouldEnableNewFocusManagement: true,
            });
        } catch {
            await showConfirmModal({
                title: copy.HEADER_TITLE,
                prompt: translate('common.genericErrorMessage'),
                confirmText: translate('common.buttonConfirm'),
                shouldShowCancelButton: false,
                shouldEnableNewFocusManagement: true,
            });
        }
    };

    return showEarlyRenewalConfirmation;
}

export default useEarlyRenewalConfirmation;
