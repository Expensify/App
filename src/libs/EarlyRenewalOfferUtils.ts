import CONST from '@src/CONST';

export default function isNonIncentivizedEarlyRenewalPeriod(timestamp = Date.now()): boolean {
    return timestamp >= Date.parse(CONST.SUBSCRIPTION.EARLY_RENEWAL.NON_INCENTIVIZED_START) && timestamp < Date.parse(CONST.SUBSCRIPTION.EARLY_RENEWAL.INCENTIVIZED_START);
}
