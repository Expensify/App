import {useRoute} from '@react-navigation/native';
import {useCallback, useEffect} from 'react';
import {navigationRef} from '@libs/Navigation/Navigation';
import NAVIGATORS from '@src/NAVIGATORS';
import {expandedRHPProgress, useWideRHPActions} from '..';

/**
 * Hook that manages super wide RHP display for a screen based on condition or optimistic state.
 * Automatically registers the route for super wide RHP when condition is met or report is marked as multi-transaction expense.
 * Cleans up the route registration when the screen is removed.
 *
 * @param condition - Boolean condition determining if the screen should display as wide RHP
 */
function useShowSuperWideRHPVersion(condition: boolean) {
    const route = useRoute();
    const reportID = route.params && 'reportID' in route.params && typeof route.params.reportID === 'string' ? route.params.reportID : '';
    const {
        showWideRHPVersion,
        showSuperWideRHPVersion,
        removeWideRHPRouteKey,
        unmarkReportIDAsMultiTransactionExpense,
        removeSuperWideRHPRouteKey,
        isReportIDMarkedAsExpense,
        isReportIDMarkedAsMultiTransactionExpense,
    } = useWideRHPActions();

    const onSuperWideRHPClose = useCallback(() => {
        removeWideRHPRouteKey(route);
        removeSuperWideRHPRouteKey(route);
        // When the RHP has been closed, expandedRHPProgress should be set to 0.
        if (navigationRef?.getRootState()?.routes?.at(-1)?.name !== NAVIGATORS.RIGHT_MODAL_NAVIGATOR) {
            expandedRHPProgress.setValue(0);
        }
    }, [removeSuperWideRHPRouteKey, removeWideRHPRouteKey, route]);

    /**
     * Effect that sets up cleanup when the screen is unmounted.
     */
    useEffect(() => () => onSuperWideRHPClose(), [onSuperWideRHPClose]);

    /**
     * Effect that determines whether to show wide RHP based on condition or optimistic state.
     * Shows wide RHP if either the condition is true OR the reportID is marked as an expense.
     */
    useEffect(() => {
        // Check if we should show wide RHP based on condition OR if reportID is in optimistic set
        const isReportMultiTransactionExpense = reportID && isReportIDMarkedAsMultiTransactionExpense(reportID);

        if (condition || isReportMultiTransactionExpense) {
            if (condition && isReportMultiTransactionExpense) {
                unmarkReportIDAsMultiTransactionExpense(reportID);
            }

            showSuperWideRHPVersion(route);
            return;
        }

        showWideRHPVersion(route);
    }, [
        condition,
        reportID,
        isReportIDMarkedAsExpense,
        route,
        showWideRHPVersion,
        showSuperWideRHPVersion,
        isReportIDMarkedAsMultiTransactionExpense,
        unmarkReportIDAsMultiTransactionExpense,
    ]);
}

export default useShowSuperWideRHPVersion;
