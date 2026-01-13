import {useEffect, useMemo, useRef, useState} from 'react';
import type {CancellationType} from '@src/CONST';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import useOnyx from './useOnyx';

function useCancellationType(): CancellationType | undefined {
    const [cancellationDetails] = useOnyx(ONYXKEYS.NVP_PRIVATE_CANCELLATION_DETAILS, {canBeMissing: true});

    const [cancellationType, setCancellationType] = useState<CancellationType | undefined>();

    // Store initial cancellation details array in a ref for comparison
    const previousCancellationDetails = useRef(cancellationDetails);

    const memoizedCancellationType = useMemo(() => {
        const pendingManualCancellation = cancellationDetails?.filter((detail) => detail.cancellationType === CONST.CANCELLATION_TYPE.MANUAL).find((detail) => !detail.cancellationDate);

        // There is a pending manual cancellation - return manual cancellation type
        if (pendingManualCancellation) {
            return CONST.CANCELLATION_TYPE.MANUAL;
        }

        // Check for cancellation with type "none"
        const noneCancellation = cancellationDetails?.find((detail) => detail.cancellationType === CONST.CANCELLATION_TYPE.NONE);
        if (noneCancellation) {
            return CONST.CANCELLATION_TYPE.NONE;
        }

        // There are no new items in the cancellation details NVP
        if (previousCancellationDetails.current?.length === cancellationDetails?.length) {
            return;
        }

        // There is a new item in the cancellation details NVP, it has to be an automatic cancellation, as pending manual cancellations are handled above
        return CONST.CANCELLATION_TYPE.AUTOMATIC;
    }, [cancellationDetails]);

    useEffect(() => {
        if (!memoizedCancellationType) {
            return;
        }

        setCancellationType(memoizedCancellationType);
    }, [memoizedCancellationType]);

    return cancellationType;
}

export default useCancellationType;
