import {doesDeleteNavigateBackUrlIncludeDuplicatesReview} from '@libs/TransactionNavigationUtils';

import {clearDeleteTransactionNavigateBackUrl, clearDeleteTransactionNavigateBackUrlAfterTransitions} from '@userActions/Report';

import ONYXKEYS from '@src/ONYXKEYS';

import {useEffect} from 'react';
import Onyx from 'react-native-onyx';

/** Clears the delete navigate back URL on unmount, since native stack never renders a popped screen unfocused. */
function useClearDeleteTransactionNavigateBackUrlOnUnmount(shouldClear: boolean) {
    useEffect(() => {
        if (!shouldClear) {
            return;
        }
        return () =>
            clearDeleteTransactionNavigateBackUrlAfterTransitions(() => {
                // Read when the clear fires, the unmounted screen may never have received the URL.
                Onyx.get(ONYXKEYS.NVP_DELETE_TRANSACTION_NAVIGATE_BACK_URL).then((url) => {
                    if (!url || doesDeleteNavigateBackUrlIncludeDuplicatesReview(url)) {
                        return;
                    }
                    requestAnimationFrame(clearDeleteTransactionNavigateBackUrl);
                });
            });
    }, [shouldClear]);
}

export default useClearDeleteTransactionNavigateBackUrlOnUnmount;
