import {useIsFocused} from '@react-navigation/native';
import {useEffect} from 'react';
import {InteractionManager} from 'react-native';
import useOnyx from '@hooks/useOnyx';
import {doesDeleteNavigateBackUrlIncludeDuplicatesReview} from '@libs/TransactionNavigationUtils';
import {clearDeleteTransactionNavigateBackUrl} from '@userActions/Report';
import ONYXKEYS from '@src/ONYXKEYS';

/**
 * Component that does not render anything but isolates the NVP_DELETE_TRANSACTION_NAVIGATE_BACK_URL
 * subscription from ReportScreen. Clears the URL after interactions complete
 * when the report is focused.
 */
function DeleteTransactionNavigateBackHandler() {
    const isFocused = useIsFocused();
    const [deleteTransactionNavigateBackUrl] = useOnyx(ONYXKEYS.NVP_DELETE_TRANSACTION_NAVIGATE_BACK_URL);

    useEffect(() => {
        if (!isFocused || !deleteTransactionNavigateBackUrl) {
            return;
        }
        if (doesDeleteNavigateBackUrlIncludeDuplicatesReview(deleteTransactionNavigateBackUrl)) {
            return;
        }
        // Clear the URL after all interactions are processed to ensure all updates are completed before hiding the skeleton
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        InteractionManager.runAfterInteractions(() => {
            requestAnimationFrame(() => {
                clearDeleteTransactionNavigateBackUrl();
            });
        });
    }, [isFocused, deleteTransactionNavigateBackUrl]);

    return null;
}

DeleteTransactionNavigateBackHandler.displayName = 'DeleteTransactionNavigateBackHandler';

export default DeleteTransactionNavigateBackHandler;
