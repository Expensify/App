import {doesDeleteNavigateBackUrlIncludeDuplicatesReview} from '@libs/TransactionNavigationUtils';

import {clearDeleteTransactionNavigateBackUrlAfterTransitions} from '@userActions/Report';

import ONYXKEYS from '@src/ONYXKEYS';

import {useEffect, useRef} from 'react';
import Onyx from 'react-native-onyx';

/** Clears the delete navigate back URL on unmount, since native stack never renders a popped screen unfocused. */
function useClearDeleteTransactionNavigateBackUrlOnUnmount(shouldClear: boolean) {
    // Latched because the deleted thread report can leave Onyx before the screen unmounts.
    const shouldClearOnUnmountRef = useRef(false);

    useEffect(() => {
        if (!shouldClear) {
            return;
        }
        shouldClearOnUnmountRef.current = true;
    }, [shouldClear]);

    useEffect(
        () => () => {
            if (!shouldClearOnUnmountRef.current) {
                return;
            }
            clearDeleteTransactionNavigateBackUrlAfterTransitions(() =>
                // Read when the clear fires, the unmounted screen may never have received the URL.
                Onyx.get(ONYXKEYS.RAM_ONLY_PENDING_TRANSACTION_DELETE_URL).then((url) => !!url && !doesDeleteNavigateBackUrlIncludeDuplicatesReview(url)),
            );
        },
        [],
    );
}

export default useClearDeleteTransactionNavigateBackUrlOnUnmount;
