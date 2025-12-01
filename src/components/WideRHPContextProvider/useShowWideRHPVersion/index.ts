import {useRoute} from '@react-navigation/native';
import {useCallback, useContext, useEffect} from 'react';
import {InteractionManager} from 'react-native';
import useBeforeRemove from '@hooks/useBeforeRemove';
import {WideRHPContext} from '..';

/**
 * Hook that manages wide RHP display for a screen based on condition or optimistic state.
 * Automatically registers the route for wide RHP when condition is met or report is marked as expense.
 * Cleans up the route registration when the screen is removed.
 *
 * @param condition - Boolean condition determining if the screen should display as wide RHP
 */
function useShowWideRHPVersion(condition: boolean) {
    const route = useRoute();
    const reportID = route.params && 'reportID' in route.params && typeof route.params.reportID === 'string' ? route.params.reportID : '';
    const {showWideRHPVersion, removeWideRHPRouteKey, isReportIDMarkedAsExpense, setIsWideRHPClosing} = useContext(WideRHPContext);

    // beforeRemove event is not called when closing nested Wide RHP using the browser back button.
    // This hook removes the route key from the array in the following case.
    useEffect(() => () => removeWideRHPRouteKey(route), [removeWideRHPRouteKey, route]);

    const onWideRHPClose = useCallback(() => {
        setIsWideRHPClosing(true);
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        InteractionManager.runAfterInteractions(() => {
            removeWideRHPRouteKey(route);
            setIsWideRHPClosing(false);
        });
    }, [removeWideRHPRouteKey, route, setIsWideRHPClosing]);

    /**
     * Effect that sets up cleanup when the screen is about to be removed.
     * Uses InteractionManager to ensure cleanup happens after closing animation.
     */
    useBeforeRemove(onWideRHPClose);

    /**
     * Effect that determines whether to show wide RHP based on condition or optimistic state.
     * Shows wide RHP if either the condition is true OR the reportID is marked as an expense.
     */
    useEffect(() => {
        // Check if we should show wide RHP based on condition OR if reportID is in optimistic set
        const shouldShow = condition || (reportID && isReportIDMarkedAsExpense(reportID));

        if (!shouldShow) {
            return;
        }
        showWideRHPVersion(route);
    }, [condition, reportID, isReportIDMarkedAsExpense, route, showWideRHPVersion]);
}

export default useShowWideRHPVersion;
