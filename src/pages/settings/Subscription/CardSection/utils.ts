import {addMonths, format, startOfMonth} from 'date-fns';
import * as SubscriptionUtils from '@libs/SubscriptionUtils';
import CONST from '@src/CONST';

/**
 * Get the next billing date.
 *
 * @returns - The next billing date in 'yyyy-MM-dd' format.
 */
function getNextBillingDate(): string {
    const today = new Date();

    const nextBillingDate = startOfMonth(addMonths(today, 1));

    return format(nextBillingDate, CONST.DATE.MONTH_DAY_YEAR_FORMAT);
}

function shouldShowPreTrialBillingBanner(): boolean {
    return !SubscriptionUtils.isUserOnFreeTrial() && !SubscriptionUtils.hasUserFreeTrialEnded();
}

export default {
    shouldShowPreTrialBillingBanner,
    getNextBillingDate,
};
