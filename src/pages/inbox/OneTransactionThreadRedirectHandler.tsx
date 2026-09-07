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

// `RHPReportScreen` also backs `SCREENS.RIGHT_MODAL.AGENT_REPORT`. Redirecting from there would eject the user out of
// the modal, so this handler opts in by route name instead of assuming every screen that mounts it is redirectable.
type ReportScreenRoute =
    | PlatformStackRouteProp<ReportsSplitNavigatorParamList, typeof SCREENS.REPORT>
    | PlatformStackRouteProp<RightModalNavigatorParamList, typeof SCREENS.RIGHT_MODAL.SEARCH_REPORT>
    | PlatformStackRouteProp<RightModalNavigatorParamList, typeof SCREENS.RIGHT_MODAL.AGENT_REPORT>;

/**
 * Whether `backTo` points at the report we are about to redirect to. `backTo` is captured from the active route when
 * the thread is opened (see `getReportRouteForCurrentContext`), so it holds the parent whenever the thread was opened
 * from it - the common case.
 */
function isBackToParentReport(backTo: Route | undefined, parentReportID: string): backTo is Route {
    if (!backTo) {
        return false;
    }

    // `backTo` is captured with a leading slash and may carry query params of its own.
    const backToPath = backTo.replace(/^\//, '').replace(/\?.*$/, '');

    // Every route that renders the parent expense report itself. `backTo` is whichever one the thread was opened from.
    const parentReportRoutes: string[] = [
        ROUTES.REPORT_WITH_ID.getRoute(parentReportID),
        ROUTES.SEARCH_REPORT.getRoute({reportID: parentReportID}),
        ROUTES.SEARCH_MONEY_REQUEST_REPORT.getRoute({reportID: parentReportID}),
        ROUTES.EXPENSE_REPORT_RHP.getRoute({reportID: parentReportID}),
    ];

    return parentReportRoutes.includes(backToPath);
}

/**
 * Renders nothing. A single-expense report already renders its only expense inline (see
 * `shouldDisplayReportTableView`), so that expense's transaction thread duplicates the report itself. Whenever a route
 * lands on such a thread - deep link, push notification, stale history entry, or a call site that resolved the IOU
 * action's `childReportID` without checking the transaction count - replace it with the report.
 *
 * Search already applies this rule at its own call sites; this handler is the route-level backstop for everything else.
 */
function OneTransactionThreadRedirectHandler() {
    const route = useRoute<ReportScreenRoute>();

    // Only the two routes this handler was written for. Anything else that mounts `ReportScreen` is left alone.
    const redirectableRoute = route.name === SCREENS.REPORT || route.name === SCREENS.RIGHT_MODAL.SEARCH_REPORT ? route : undefined;

    const reportIDFromRoute = getNonEmptyStringOnyxID(redirectableRoute?.params?.reportID);
    const isFocused = useIsFocused();

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportIDFromRoute}`);
    const parentReportID = getNonEmptyStringOnyxID(report?.parentReportID);

    // A gate the shared definition does not have: that derivation reads whatever report actions are in Onyx, so a
    // multi-expense report still paginating in can briefly look like a single-expense one - and navigating on that is
    // unrecoverable.
    const [isParentOneTransactionReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${parentReportID}`, {selector: isOneTransactionReport});

    // The same definition `HeaderView` and `SidebarUtils` use, so the redirect and the views that render the thread
    // agree. Gated on the parent's transaction count first: without it every plain comment thread would subscribe to
    // its chat's entire report action list. Passing `undefined` keeps the hook call unconditional but inert.
    const isOneTransactionThread = useIsOneTransactionThread(isParentOneTransactionReport ? report : undefined);

    // A message deep link points at an action inside the thread, so dropping the thread route would drop its anchor.
    const hasLinkedReportAction = !!redirectableRoute?.params?.reportActionID;

    // A push notification opens its target with `referrer=notification`, which is what lets `useMarkAsRead` mark the
    // report read without waiting on window focus, so it has to survive the redirect. It only exists on the inbox route.
    const referrer = redirectableRoute?.name === SCREENS.REPORT ? redirectableRoute.params?.referrer : undefined;

    const shouldRedirectToParentReport = !!redirectableRoute && !!parentReportID && !!isParentOneTransactionReport && isOneTransactionThread;

    // The replace unmounts this screen, but Onyx updates can land before the transition finishes. Keyed by report so a
    // later route onto a different thread still redirects.
    const redirectedFromReportIDRef = useRef<string | undefined>(undefined);

    // `reportActionID` is mutable, and the app clears it on this very route while the user is still reading the
    // thread - jumping to the live tail once they send a comment (`useReportActionsNewActionLiveTail`), or dropping an
    // anchor whose action got deleted (`LinkedActionNotFoundGuard`). Reading it live would turn either into a redirect
    // that ejects the user mid-session, so latch how the route was opened instead. Keyed by report, because this
    // handler is not remounted when a later route swaps the screen's `reportID` for another thread.
    const openedWithLinkedActionRef = useRef<{reportID: string | undefined; hadLinkedReportAction: boolean} | undefined>(undefined);

    useEffect(() => {
        const latched = openedWithLinkedActionRef.current;
        const openedWithLinkedAction = latched && latched.reportID === reportIDFromRoute ? latched : {reportID: reportIDFromRoute, hadLinkedReportAction: hasLinkedReportAction};
        openedWithLinkedActionRef.current = openedWithLinkedAction;

        if (!isFocused || openedWithLinkedAction.hadLinkedReportAction || !shouldRedirectToParentReport || redirectedFromReportIDRef.current === reportIDFromRoute) {
            return;
        }
        redirectedFromReportIDRef.current = reportIDFromRoute;

        // Reuse the route's own `backTo`, not the active route - that points at the thread we are replacing and would
        // bounce the user straight back here.
        const backTo = redirectableRoute?.params?.backTo;

        // `backTo` already points at the parent we want. Replacing would leave `parent -> parent?backTo=parent` on the
        // stack, so the first Back appears to do nothing. Pop onto the parent that is already there instead.
        if (isBackToParentReport(backTo, parentReportID)) {
            Navigation.isNavigationReady().then(() => {
                Navigation.goBack(backTo);
            });
            return;
        }

        const reportRoute =
            redirectableRoute?.name === SCREENS.RIGHT_MODAL.SEARCH_REPORT
                ? ROUTES.SEARCH_REPORT.getRoute({reportID: parentReportID, backTo})
                : ROUTES.REPORT_WITH_ID.getRoute(parentReportID, undefined, referrer, backTo);

        Navigation.isNavigationReady().then(() => {
            Navigation.navigate(reportRoute, {forceReplace: true});
        });
    }, [isFocused, shouldRedirectToParentReport, hasLinkedReportAction, reportIDFromRoute, parentReportID, redirectableRoute?.name, redirectableRoute?.params?.backTo, referrer]);

    return null;
}

OneTransactionThreadRedirectHandler.displayName = 'OneTransactionThreadRedirectHandler';

export default OneTransactionThreadRedirectHandler;
