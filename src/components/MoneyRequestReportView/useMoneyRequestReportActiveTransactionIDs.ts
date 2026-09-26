import {CAROUSEL_SOURCE, clearActiveTransactionIDsForSource, getActiveTransactionIDs, setActiveTransactionIDs} from '@libs/actions/TransactionThreadNavigation';
import {navigationRef} from '@libs/Navigation/Navigation';

import SCREENS from '@src/SCREENS';

import {findFocusedRoute} from '@react-navigation/native';
import {useEffect, useRef} from 'react';

/**
 * When this report is open in the super-wide RHP, seeds the transaction-thread carousel with the
 * transaction IDs in the order the user sees them, and clears them again on unmount.
 */
function useMoneyRequestReportActiveTransactionIDs(visualOrderTransactionIDs: string[], reportID: string | undefined) {
    const visualOrderTransactionIDsKey = visualOrderTransactionIDs.join(',');

    const carouselSource = CAROUSEL_SOURCE.report(reportID);
    const hasSeededCarouselRef = useRef(false);

    useEffect(() => {
        const focusedRoute = findFocusedRoute(navigationRef.getRootState());
        if (focusedRoute?.name !== SCREENS.RIGHT_MODAL.SEARCH_REPORT) {
            return;
        }

        const {ids: activeIDs, descriptors: activeDescriptors, source: activeSource} = getActiveTransactionIDs();
        if (activeDescriptors) {
            return;
        }

        if (visualOrderTransactionIDs.length === 0 || (visualOrderTransactionIDs.length < 2 && activeSource !== carouselSource)) {
            return;
        }

        // A report preview press seeds these arrows in the carousel's order, which can differ from this list's order.
        // Keep that seed while it still covers exactly these rows, and re-seed only when the rows themselves change.
        if (activeIDs && activeIDs.length === visualOrderTransactionIDs.length) {
            const activeIDSet = new Set(activeIDs);
            if (visualOrderTransactionIDs.every((transactionID) => activeIDSet.has(transactionID))) {
                return;
            }
        }

        setActiveTransactionIDs(visualOrderTransactionIDs, {source: carouselSource});
        hasSeededCarouselRef.current = true;
        // eslint-disable-next-line react-hooks/exhaustive-deps -- visualOrderTransactionIDsKey is an order-sensitive proxy for the array
    }, [visualOrderTransactionIDsKey, carouselSource]);

    useEffect(() => {
        return () => {
            if (!hasSeededCarouselRef.current) {
                return;
            }
            hasSeededCarouselRef.current = false;
            clearActiveTransactionIDsForSource(carouselSource);
        };
    }, [carouselSource]);
}

export default useMoneyRequestReportActiveTransactionIDs;
