import {StackActions} from '@react-navigation/native';
import navigationRef from '@libs/Navigation/navigationRef';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

/**
 * Pops any report screens stacked above the given target report in the active
 * `REPORTS_SPLIT_NAVIGATOR`. Use this instead of `Navigation.goBack(reportRoute)`
 * when you need to reliably land on an existing report screen in the stack.
 *
 * Why not `goBack(reportRoute)`?
 * `goBack`/`goUp` compares params (default `compareParams: true`) to locate the
 * target route. If the existing report screen has additional params (e.g. a
 * `reportActionID` set by `ParentNavigationSubtitle` when the user returns via
 * a thread's "From {…}" header), the lookup fails, and `goUp` falls back to a
 * REPLACE dispatched at the root navigator. That REPLACE can spawn a duplicate
 * `TAB_NAVIGATOR`/report pair, making the report appear twice and forcing the
 * user to press back once per duplicate.
 *
 * This helper sidesteps the issue by issuing an explicit `StackActions.pop`
 * targeted at the `REPORTS_SPLIT_NAVIGATOR` itself. If the target report is
 * already on top (or not present in the split navigator), the call is a no-op.
 */
function popReportsSplitNavigatorToReport(targetReportID: string | undefined): void {
    if (!targetReportID) {
        return;
    }
    const rootState = navigationRef.getRootState();
    const tabNav = rootState?.routes?.findLast((route) => route.name === NAVIGATORS.TAB_NAVIGATOR);
    const splitNav = tabNav?.state?.routes?.findLast((route) => route.name === NAVIGATORS.REPORTS_SPLIT_NAVIGATOR);
    const splitRoutes = splitNav?.state?.routes;
    const splitNavKey = splitNav?.state?.key;
    if (!splitRoutes || !splitNavKey) {
        return;
    }
    const targetIndex = splitRoutes.findLastIndex(
        (route) =>
            route.name === SCREENS.REPORT &&
            typeof route.params === 'object' &&
            route.params !== null &&
            'reportID' in route.params &&
            (route.params as {reportID?: string}).reportID === targetReportID,
    );
    if (targetIndex === -1) {
        return;
    }
    const popCount = splitRoutes.length - 1 - targetIndex;
    if (popCount <= 0) {
        return;
    }
    navigationRef.dispatch({...StackActions.pop(popCount), target: splitNavKey});
}

export default popReportsSplitNavigatorToReport;
