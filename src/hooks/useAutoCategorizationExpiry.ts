/** Expires auto-categorization in Onyx so every violation consumer updates when the grace period ends. */
import {getAutoCategorizationDeadline} from '@libs/TransactionUtils';
import {clearPendingAutoCategorizationTime} from '@userActions/Transaction';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

import {useEffect} from 'react';

import useOnyx from './useOnyx';

function getNextExpiry(transactions: OnyxCollection<Transaction>) {
    let nextExpiry: {transactionID: string; deadline: number} | undefined;
    for (const transaction of Object.values(transactions ?? {})) {
        const deadline = getAutoCategorizationDeadline(transaction);
        if (!transaction || deadline === undefined || (nextExpiry && deadline >= nextExpiry.deadline)) {
            continue;
        }
        nextExpiry = {transactionID: transaction.transactionID, deadline};
    }
    return nextExpiry;
}

function useAutoCategorizationExpiry() {
    const [nextExpiry] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {selector: getNextExpiry});
    const transactionID = nextExpiry?.transactionID;
    const deadline = nextExpiry?.deadline;

    useEffect(() => {
        if (!transactionID || deadline === undefined) {
            return;
        }

        let timeoutID: ReturnType<typeof setTimeout> | undefined;
        const scheduleTimeout = () => {
            const remainingTime = deadline - Date.now();
            // Match useIsPastDate: large delays must be split to avoid setTimeout overflow.
            if (remainingTime > CONST.LIMIT_TIMEOUT) {
                timeoutID = setTimeout(scheduleTimeout, CONST.LIMIT_TIMEOUT);
                return;
            }
            timeoutID = setTimeout(() => {
                clearPendingAutoCategorizationTime(transactionID);
            }, Math.max(remainingTime, 0));
        };
        scheduleTimeout();

        return () => clearTimeout(timeoutID);
    }, [transactionID, deadline]);
}

export default useAutoCategorizationExpiry;
