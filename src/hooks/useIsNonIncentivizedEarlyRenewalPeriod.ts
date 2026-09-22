import isNonIncentivizedEarlyRenewalPeriod from '@libs/EarlyRenewalOfferUtils';

import CONST from '@src/CONST';

import {useEffect, useState} from 'react';

const MAX_TIMEOUT_MS = 2_147_483_647;

function getNextPhaseBoundary(timestamp: number): number | null {
    const nonIncentivizedStart = Date.parse(CONST.SUBSCRIPTION.EARLY_RENEWAL.NON_INCENTIVIZED_START);
    const incentivizedStart = Date.parse(CONST.SUBSCRIPTION.EARLY_RENEWAL.INCENTIVIZED_START);

    if (timestamp < nonIncentivizedStart) {
        return nonIncentivizedStart;
    }
    if (timestamp < incentivizedStart) {
        return incentivizedStart;
    }
    return null;
}

function useIsNonIncentivizedEarlyRenewalPeriod(): boolean {
    const [isNonIncentivizedPeriod, setIsNonIncentivizedPeriod] = useState(isNonIncentivizedEarlyRenewalPeriod);

    useEffect(() => {
        let timeoutID: ReturnType<typeof setTimeout> | undefined;

        const updatePeriod = () => {
            const timestamp = Date.now();
            setIsNonIncentivizedPeriod(isNonIncentivizedEarlyRenewalPeriod(timestamp));

            const nextPhaseBoundary = getNextPhaseBoundary(timestamp);
            if (nextPhaseBoundary === null) {
                return;
            }
            timeoutID = setTimeout(updatePeriod, Math.min(nextPhaseBoundary - timestamp + 1, MAX_TIMEOUT_MS));
        };

        updatePeriod();
        return () => clearTimeout(timeoutID);
    }, []);

    return isNonIncentivizedPeriod;
}

export default useIsNonIncentivizedEarlyRenewalPeriod;
