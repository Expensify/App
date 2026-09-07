import useIsOneTransactionThread from '@hooks/useIsOneTransactionThread';
import useOnyx from '@hooks/useOnyx';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import {isOneTransactionReport} from '@libs/ReportUtils';

import type {ReportsSplitNavigatorParamList, RightModalNavigatorParamList} from '@navigation/types';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import {useIsFocused, useRoute} from '@react-navigation/native';
import {useEffect, useRef} from 'react';

type ReportScreenRoute =
    | PlatformStackRouteProp<ReportsSplitNavigatorParamList, typeof SCREENS.REPORT>
    | PlatformStackRouteProp<RightModalNavigatorParamList, typeof SCREENS.RIGHT_MODAL.SEARCH_REPORT>;

/**
 * Whether `backTo` points at the report we are about to redirect to. `backTo` is captured from the active route when
 * the thread is opened (see `getReportRouteForCurrentContext`), so it holds the parent report whenever the thread was
 * opened from that parent - which is the common case.
 */
function isBackToParentReport(backTo: Route | undefined, parentReportID: string): backTo is Route {
    if (!backTo) {
        return false;
    }

    // The active route is captured with a leading slash and may carry query params of its own.
    const backToPath = backTo.replace(/^\//, '').replace(/\?.*$/, '');
    return backToPath === ROUTES.REPORT_WITH_ID.getRoute(parentReportID) || backToPath === ROUTES.SEARCH_REPORT.getRoute({reportID: parentReportID});
}

/**
 * Component that does not render anything. A single-expense report already renders its only expense inline
 * (see `shouldDisplayReportTableView`), so that expense's transaction thread is a duplicate of the report itself.
 * Whenever a route lands on such a thread - a deep link, a push notification, a stale history entry, or any
 * navigation call site that resolved the IOU action's `childReportID` without checking the transaction count -
 * replace it with the report so the user always ends up on the single-expense report view.
 *
 * Search already applies this rule at its own call sites (`getReportIDForTransaction`,
 * `createAndOpenSearchTransactionThread`); this handler is the route-level backstop for everything else.
 */
function OneTransactionThreadRedirectHandler() {
    const route = useRoute<ReportScreenRoute>();
    const reportIDFromRoute = getNonEmptyStringOnyxID(route.params?.reportID);
    const isFocused = useIsFocused();

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportIDFromRoute}`);
    const parentReportID = getNonEmptyStringOnyxID(report?.parentReportID);

    // The same definition `HeaderView` and `SidebarUtils` use through `ReportUtils.isOneTransactionThread`, including
    // the send money exclusion. Sharing it keeps the redirect and the views that render the thread in agreement.
    const isOneTransactionThread = useIsOneTransactionThread(report);

    // A gate the shared definition does not have, because only navigating on it is unrecoverable: that derivation
    // reads whatever report actions are in Onyx, so while a multi-expense report is still paginating in only one IOU
    // action may be present and the report would briefly look like a single-expense one.
    const [isParentOneTransactionReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${parentReportID}`, {selector: isOneTransactionReport});

    // A message deep link is left alone: it points at an action inside the thread, and dropping the thread
    // route would drop the anchor the link was opened for.
    const hasLinkedReportAction = !!route.params?.reportActionID;

    const shouldRedirectToParentReport = !!parentReportID && !hasLinkedReportAction && !!isParentOneTransactionReport && isOneTransactionThread;

    // The replace unmounts this screen, but Onyx updates can land before the transition finishes. Keyed by the
    // report we redirected away from so a later route onto a different thread still redirects.
    const redirectedFromReportIDRef = useRef<string | undefined>(undefined);

    useEffect(() => {
        if (!isFocused || !shouldRedirectToParentReport || redirectedFromReportIDRef.current === reportIDFromRoute) {
            return;
        }
        redirectedFromReportIDRef.current = reportIDFromRoute;

        // Reuse the route's own `backTo` rather than the active route, otherwise back would return to the thread
        // we are replacing and bounce the user straight back here.
        const backTo = route.params?.backTo;

        // When the thread was opened from the parent report, that parent is both where we want to end up and where
        // `backTo` already points. Replacing the thread with a copy of it would leave `parent -> parent?backTo=parent`
        // on the stack, so the first Back appears to do nothing and the copy carries a self-referential fallback.
        // Pop onto the parent that is already there instead.
        if (isBackToParentReport(backTo, parentReportID)) {
            Navigation.isNavigationReady().then(() => {
                Navigation.goBack(backTo);
            });
            return;
        }

        const reportRoute =
            route.name === SCREENS.RIGHT_MODAL.SEARCH_REPORT
                ? ROUTES.SEARCH_REPORT.getRoute({reportID: parentReportID, backTo})
                : ROUTES.REPORT_WITH_ID.getRoute(parentReportID, undefined, undefined, backTo);

        Navigation.isNavigationReady().then(() => {
            Navigation.navigate(reportRoute, {forceReplace: true});
        });
    }, [isFocused, shouldRedirectToParentReport, reportIDFromRoute, parentReportID, route.name, route.params?.backTo]);

    return null;
}

OneTransactionThreadRedirectHandler.displayName = 'OneTransactionThreadRedirectHandler';

export default OneTransactionThreadRedirectHandler;
