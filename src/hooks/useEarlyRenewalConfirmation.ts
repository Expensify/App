import {ModalActions} from '@components/Modal/Global/ModalContext';

import {acceptEarlyRenewalOffer} from '@libs/actions/EarlyRenewalOffer';
import DateUtils from '@libs/DateUtils';
import {getNonIncentivizedEarlyRenewalDates} from '@libs/EarlyRenewalOfferUtils';

import CONST from '@src/CONST';

import useConfirmModal from './useConfirmModal';
import useLocalize from './useLocalize';

/** Opens the confirmation modal for the non-incentivized early renewal offer. */
function useEarlyRenewalConfirmation() {
    const {showConfirmModal} = useConfirmModal();
    const {translate, dateFnsLocale} = useLocalize();

    const showEarlyRenewalConfirmation = async () => {
        const {startDate, endDate} = getNonIncentivizedEarlyRenewalDates();
        const result = await showConfirmModal({
            title: translate('earlyRenewal.confirmTitle'),
            prompt: translate('earlyRenewal.confirmationDescription', {
                startDate: DateUtils.formatWithUTCTimeZone(startDate, CONST.DATE.MONTH_DAY_YEAR_FORMAT, dateFnsLocale),
                endDate: DateUtils.formatWithUTCTimeZone(endDate, CONST.DATE.MONTH_DAY_YEAR_FORMAT, dateFnsLocale),
            }),
            confirmText: translate('earlyRenewal.renew'),
            cancelText: translate('common.cancel'),
            shouldDisableConfirmButtonWhenOffline: true,
            shouldEnableNewFocusManagement: true,
        });

        if (result.action !== ModalActions.CONFIRM) {
            return;
        }

        acceptEarlyRenewalOffer(CONST.SUBSCRIPTION.EARLY_RENEWAL.OFFER_ID.NON_INCENTIVIZED_ONE_YEAR);
    };

    return showEarlyRenewalConfirmation;
}

export default useEarlyRenewalConfirmation;
