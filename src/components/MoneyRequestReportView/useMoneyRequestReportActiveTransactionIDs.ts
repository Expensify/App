import {clearActiveTransactionIDs, getActiveTransactionIDs, setActiveTransactionIDs} from '@libs/actions/TransactionThreadNavigation';
import {navigationRef} from '@libs/Navigation/Navigation';

import SCREENS from '@src/SCREENS';

import {findFocusedRoute} from '@react-navigation/native';
import {useEffect} from 'react';

/**
 * When this report is open in the super-wide RHP, seeds the transaction-thread carousel with the
 * transaction IDs in the order the user sees them, and clears them again on unmount.
 */
function useMoneyRequestReportActiveTransactionIDs(visualOrderTransactionIDs: string[]) {
    // Primitive proxy for visualOrderTransactionIDs used as the effect dependency below.
    // Other callers (e.g. TransactionDuplicateReview.onPreviewPressed) can write to the same
    // Onyx key with a different ordering. Using the raw array reference would cause the effect
    // to re-fire on every referential change and overwrite those IDs. The joined string ensures
    // the effect only re-fires when the actual content changes.
    const visualOrderTransactionIDsKey = visualOrderTransactionIDs.join(',');

    useEffect(() => {
        const focusedRoute = findFocusedRoute(navigationRef.getRootState());
        if (focusedRoute?.name !== SCREENS.RIGHT_MODAL.SEARCH_REPORT) {
            return;
        }
        // Don't take over a snapshot-backed carousel (identified by its sibling descriptors, e.g. the Home
        // "Recently added" flow) that belongs to the transaction thread sitting underneath this report.
        // Overwriting and then clearing it would drop that carousel when the user navigates back. Row presses
        // still seed the correct siblings lazily via useNavigateToTransactionThread.
        if (getActiveTransactionIDs().descriptors) {
            return;
        }
        setActiveTransactionIDs(visualOrderTransactionIDs);
        return () => {
            clearActiveTransactionIDs();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps -- visualOrderTransactionIDsKey is a primitive proxy for the array to avoid re-firing on referential-only changes
    }, [visualOrderTransactionIDsKey]);
}

export default useMoneyRequestReportActiveTransactionIDs;
