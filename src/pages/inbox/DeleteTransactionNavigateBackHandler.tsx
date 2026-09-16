import useOnyx from '@hooks/useOnyx';

import TransitionTracker from '@libs/Navigation/TransitionTracker';
import {doesDeleteNavigateBackUrlIncludeDuplicatesReview} from '@libs/TransactionNavigationUtils';

import {clearDeleteTransactionNavigateBackUrl} from '@userActions/Report';

import ONYXKEYS from '@src/ONYXKEYS';

import {useIsFocused} from '@react-navigation/native';
import {useEffect} from 'react';

/**
 * Component that does not render anything but isolates the NVP_DELETE_TRANSACTION_NAVIGATE_BACK_URL
 * subscription from ReportScreen. Clears the URL after interactions complete
 * when the report is no longer focused.
 */
function DeleteTransactionNavigateBackHandler() {
    const isFocused = useIsFocused();
    const [deleteTransactionNavigateBackUrl] = useOnyx(ONYXKEYS.NVP_DELETE_TRANSACTION_NAVIGATE_BACK_URL);

    useEffect(() => {
        if (isFocused || !deleteTransactionNavigateBackUrl) {
            return;
        }
        if (doesDeleteNavigateBackUrlIncludeDuplicatesReview(deleteTransactionNavigateBackUrl)) {
            return;
        }
        // Clear the URL only after we navigate away to avoid a brief Not Found flash.
        const handle = TransitionTracker.runAfterTransitions({
            callback: () => {
                requestAnimationFrame(clearDeleteTransactionNavigateBackUrl);
            },
            waitForUpcomingTransition: true,
        });
        return () => handle.cancel();
    }, [isFocused, deleteTransactionNavigateBackUrl]);

    return null;
}

DeleteTransactionNavigateBackHandler.displayName = 'DeleteTransactionNavigateBackHandler';

export default DeleteTransactionNavigateBackHandler;
