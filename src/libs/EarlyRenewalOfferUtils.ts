import CONST from '@src/CONST';

export default function isNonIncentivizedEarlyRenewalPeriod(timestamp = Date.now()): boolean {
    return timestamp >= Date.parse(CONST.SUBSCRIPTION.EARLY_RENEWAL.NON_INCENTIVIZED_START) && timestamp < Date.parse(CONST.SUBSCRIPTION.EARLY_RENEWAL.INCENTIVIZED_START);
}

function isIncentivizedEarlyRenewalPeriod(timestamp = Date.now()): boolean {
    return timestamp >= Date.parse(CONST.SUBSCRIPTION.EARLY_RENEWAL.INCENTIVIZED_START) && timestamp < Date.parse(CONST.SUBSCRIPTION.EARLY_RENEWAL.CAMPAIGN_END);
}

function getNonIncentivizedEarlyRenewalDates(timestamp = Date.now()) {
    const acceptedAt = new Date(timestamp);
    const year = acceptedAt.getUTCFullYear();
    const month = acceptedAt.getUTCMonth();

    // Match Auth's acceptance-month anchor so January renewals move to the month the offer is accepted.
    return {
        startDate: new Date(Date.UTC(year, month, 1)).toISOString(),
        endDate: new Date(Date.UTC(year + 1, month, 1)).toISOString(),
    };
}

export {getNonIncentivizedEarlyRenewalDates, isIncentivizedEarlyRenewalPeriod};
