import {canRetryReceipt} from '@libs/ReceiptUploadRetryHandler';

import CONST from '@src/CONST';
import type {ReceiptError} from '@src/types/onyx/Transaction';

import {useEffect, useState} from 'react';

/**
 * Whether a failed receipt upload can still be retried, which comes down to whether the file is reachable.
 * Returns `undefined` while the check is in flight, so callers can hold the button back rather than render it and then take it away.
 */
function useReceiptRetryAvailability(receiptError: ReceiptError | undefined): boolean | undefined {
    const source = receiptError?.source;
    const isRetryableAction = receiptError?.action === CONST.IOU.ACTION_PARAMS.MONEY_REQUEST;
    const isEligible = !!source && isRetryableAction;

    const [checked, setChecked] = useState<{source: string; canRetry: boolean}>();

    useEffect(() => {
        if (!isEligible) {
            return;
        }

        let isCurrent = true;
        canRetryReceipt(source).then((canRetry) => {
            if (!isCurrent) {
                return;
            }
            setChecked({source, canRetry});
        });

        return () => {
            isCurrent = false;
        };
    }, [isEligible, source]);

    if (!isEligible) {
        return false;
    }
    return checked?.source === source ? checked.canRetry : undefined;
}

export default useReceiptRetryAvailability;
