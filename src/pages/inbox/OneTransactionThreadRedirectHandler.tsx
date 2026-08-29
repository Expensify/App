import useOneTransactionThreadReportID from '@hooks/useOneTransactionThreadReportID';
import useOnyx from '@hooks/useOnyx';
import useParentReportAction from '@hooks/useParentReportAction';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import {isSentMoneyReportAction} from '@libs/ReportActionsUtils';

import type {ReportsSplitNavigatorParamList, RightModalNavigatorParamList} from '@navigation/types';

import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import {useIsFocused, useRoute} from '@react-navigation/native';
import {useEffect, useRef} from 'react';

type ReportScreenRoute =
    | PlatformStackRouteProp<ReportsSplitNavigatorParamList, typeof SCREENS.REPORT>
    | PlatformStackRouteProp<RightModalNavigatorParamList, typeof SCREENS.RIGHT_MODAL.SEARCH_REPORT>;

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
    const parentReportAction = useParentReportAction(report);

    // Resolving this against the parent report tells us both that the parent holds exactly one expense and that
    // the current route is the thread of that expense, so no separate transaction-count check is needed.
    const oneTransactionThreadReportID = useOneTransactionThreadReportID(parentReportID);

    // A message deep link is left alone: it points at an action inside the thread, and dropping the thread
    // route would drop the anchor the link was opened for.
    const hasLinkedReportAction = !!route.params?.reportActionID;

    // Sending money keeps its own thread - `isOneTransactionThread` excludes it too - because the report and the
    // thread are not interchangeable there.
    const shouldRedirectToParentReport =
        !!parentReportID && !hasLinkedReportAction && oneTransactionThreadReportID === reportIDFromRoute && !isSentMoneyReportAction(parentReportAction);

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
