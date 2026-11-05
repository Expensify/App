import CONST from '@src/CONST';

import {isPast} from 'date-fns';
import {useEffect, useState} from 'react';

/**
 * Returns whether `date` has passed, and re-renders exactly once when it does.
 * A plain `isPast(date)` in render is memoized by React Compiler on `date`, so it would never flip while `date` stays the same.
 */
function useIsPastDate(date: string | undefined): boolean {
    const [passedDate, setPassedDate] = useState<string>();
    const hasPassed = !!date && (passedDate === date || isPast(date));

    useEffect(() => {
        if (!date || hasPassed) {
            return;
        }
        const targetTime = new Date(date).getTime();
        if (Number.isNaN(targetTime)) {
            return;
        }
        let timeoutID: ReturnType<typeof setTimeout> | undefined;

        // setTimeout overflows above CONST.LIMIT_TIMEOUT, so wait in LIMIT_TIMEOUT steps until the target is in range (same as UserStatusHandler)
        const scheduleTimeout = () => {
            const remainingTime = targetTime - Date.now();
            if (remainingTime > CONST.LIMIT_TIMEOUT) {
                timeoutID = setTimeout(scheduleTimeout, CONST.LIMIT_TIMEOUT);
                return;
            }
            timeoutID = setTimeout(() => setPassedDate(date), Math.max(remainingTime, 0));
        };
        scheduleTimeout();

        return () => clearTimeout(timeoutID);
    }, [date, hasPassed]);

    return hasPassed;
}

export default useIsPastDate;
