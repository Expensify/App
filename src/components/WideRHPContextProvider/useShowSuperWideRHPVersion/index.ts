import {useRoute} from '@react-navigation/native';
import {useCallback, useContext, useEffect} from 'react';
import {InteractionManager} from 'react-native';
import useBeforeRemove from '@hooks/useBeforeRemove';
import {WideRHPContext} from '..';

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
    const {showWideRHPVersion, showSuperWideRHPVersion, removeWideRHPRouteKey, removeSuperWideRHPRouteKey, isReportIDMarkedAsExpense, isReportIDMarkedAsMultiTransactionExpense} =
        useContext(WideRHPContext);

    const onSuperWideRHPClose = useCallback(() => {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        InteractionManager.runAfterInteractions(() => {
            removeWideRHPRouteKey(route);
            removeSuperWideRHPRouteKey(route);
        });
    }, [removeSuperWideRHPRouteKey, removeWideRHPRouteKey, route]);

    useBeforeRemove(onSuperWideRHPClose);

    /**
     * Effect that determines whether to show wide RHP based on condition or optimistic state.
     * Shows wide RHP if either the condition is true OR the reportID is marked as an expense.
     */
    useEffect(() => {
        // Check if we should show wide RHP based on condition OR if reportID is in optimistic set
        if (condition || (reportID && isReportIDMarkedAsMultiTransactionExpense(reportID))) {
            showSuperWideRHPVersion(route);
            return;
        }
        showWideRHPVersion(route);
    }, [condition, reportID, isReportIDMarkedAsExpense, route, showWideRHPVersion, showSuperWideRHPVersion, isReportIDMarkedAsMultiTransactionExpense]);
}

export default useShowSuperWideRHPVersion;
