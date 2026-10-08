import isNonIncentivizedEarlyRenewalPeriod, {isIncentivizedEarlyRenewalPeriod} from '@libs/EarlyRenewalOfferUtils';

import CONST from '@src/CONST';

import {useEffect, useState} from 'react';

const MAX_TIMEOUT_MS = 2_147_483_647;

function getNextPhaseBoundary(timestamp: number): number | null {
    const nonIncentivizedStart = Date.parse(CONST.SUBSCRIPTION.EARLY_RENEWAL.NON_INCENTIVIZED_START);
    const incentivizedStart = Date.parse(CONST.SUBSCRIPTION.EARLY_RENEWAL.INCENTIVIZED_START);
    const campaignEnd = Date.parse(CONST.SUBSCRIPTION.EARLY_RENEWAL.CAMPAIGN_END);

    if (timestamp < nonIncentivizedStart) {
        return nonIncentivizedStart;
    }
    if (timestamp < incentivizedStart) {
        return incentivizedStart;
    }
    if (timestamp < campaignEnd) {
        return campaignEnd;
    }
    return null;
}

function useEarlyRenewalPeriod() {
    const [timestamp, setTimestamp] = useState(Date.now);

    useEffect(() => {
        let timeoutID: ReturnType<typeof setTimeout> | undefined;

        const updatePeriod = () => {
            const currentTimestamp = Date.now();
            setTimestamp(currentTimestamp);

            const nextPhaseBoundary = getNextPhaseBoundary(currentTimestamp);
            if (nextPhaseBoundary === null) {
                return;
            }
            timeoutID = setTimeout(updatePeriod, Math.min(nextPhaseBoundary - currentTimestamp + 1, MAX_TIMEOUT_MS));
        };

        updatePeriod();
        return () => clearTimeout(timeoutID);
    }, []);

    return {
        isNonIncentivizedPeriod: isNonIncentivizedEarlyRenewalPeriod(timestamp),
        isIncentivizedPeriod: isIncentivizedEarlyRenewalPeriod(timestamp),
    };
}

export default useEarlyRenewalPeriod;
