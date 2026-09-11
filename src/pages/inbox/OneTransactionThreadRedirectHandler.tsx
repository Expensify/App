import useIsOneTransactionThread from '@hooks/useIsOneTransactionThread';
import useOnyx from '@hooks/useOnyx';
import useParentReportAction from '@hooks/useParentReportAction';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import {getLinkedTransactionID} from '@libs/ReportActionsUtils';

import type {ReportsSplitNavigatorParamList, RightModalNavigatorParamList} from '@navigation/types';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {Report} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {useIsFocused, useRoute} from '@react-navigation/native';
import {useEffect, useRef} from 'react';

// `RHPReportScreen` also backs `AGENT_REPORT`, where a redirect would eject the user out of the modal, so this handler
// opts in by route name.
type ReportScreenRoute =
    | PlatformStackRouteProp<ReportsSplitNavigatorParamList, typeof SCREENS.REPORT>
    | PlatformStackRouteProp<RightModalNavigatorParamList, typeof SCREENS.RIGHT_MODAL.SEARCH_REPORT>
    | PlatformStackRouteProp<RightModalNavigatorParamList, typeof SCREENS.RIGHT_MODAL.AGENT_REPORT>;

function selectTransactionCount(report: OnyxEntry<Report>): number | undefined {
    return report?.transactionCount;
}

// Report action IDs are numeric, which tells the optional `:reportActionID` anchor apart from a nested sub-route.
const REPORT_ACTION_ID_SEGMENT = /^\d+$/;

/** Whether `backTo` points at the report we are about to redirect to. */
function isBackToParentReport(backTo: Route | undefined, parentReportID: string): backTo is Route {
    if (!backTo) {
        return false;
    }

    // `backTo` has a leading slash and may carry query params of its own.
    const backToPath = backTo.replace(/^\//, '').replace(/\?.*$/, '');

    // Every route that renders the parent report itself. Only the first two end in an optional `:reportActionID`.
    const parentReportRoutes: Array<{path: string; hasOptionalReportActionID: boolean}> = [
        {path: ROUTES.REPORT_WITH_ID.getRoute(parentReportID), hasOptionalReportActionID: true},
        {path: ROUTES.SEARCH_REPORT.getRoute({reportID: parentReportID}), hasOptionalReportActionID: true},
        {path: ROUTES.SEARCH_MONEY_REQUEST_REPORT.getRoute({reportID: parentReportID}), hasOptionalReportActionID: false},
        {path: ROUTES.EXPENSE_REPORT_RHP.getRoute({reportID: parentReportID}), hasOptionalReportActionID: false},
    ];

    // `/r/<parent>/<actionID>` still renders the parent, so one numeric trailing segment is accepted. A bare prefix
    // match would not do: `createDynamicRoute` nests dynamic modals under the active route, so
    // `/r/<parent>/duplicates/review/<thread>` would look like the parent and pop the user back into the review page.
    return parentReportRoutes.some(({path, hasOptionalReportActionID}) => {
        if (backToPath === path) {
            return true;
        }
        if (!hasOptionalReportActionID || !backToPath.startsWith(`${path}/`)) {
            return false;
        }
        return REPORT_ACTION_ID_SEGMENT.test(backToPath.slice(path.length + 1));
    });
}

/**
 * Renders nothing. A single-expense report renders its only expense inline (see `shouldDisplayReportTableView`), so
 * that expense's transaction thread duplicates the report. This replaces such a route with the report itself - the
 * route-level backstop for entry points that don't check the transaction count themselves.
 */
function OneTransactionThreadRedirectHandler() {
    const route = useRoute<ReportScreenRoute>();

    // Only the two routes this handler was written for; anything else that mounts `ReportScreen` is left alone.
    const redirectableRoute = route.name === SCREENS.REPORT || route.name === SCREENS.RIGHT_MODAL.SEARCH_REPORT ? route : undefined;

    const reportIDFromRoute = getNonEmptyStringOnyxID(redirectableRoute?.params?.reportID);
    const isFocused = useIsFocused();

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportIDFromRoute}`);
    const parentReportID = getNonEmptyStringOnyxID(report?.parentReportID);

    // A multi-expense report still paginating in can briefly look like a single-expense one, so gate on the server
    // count too. Kept as the raw count so the effect below can tell "not loaded yet" from "more than one expense".
    const [parentTransactionCount] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${parentReportID}`, {selector: selectTransactionCount});
    const isParentOneTransactionReport = parentTransactionCount === 1;

    // The same definition `HeaderView` and `SidebarUtils` use, so the redirect and the thread's own views agree.
    // Passing `undefined` keeps the call inert, so plain comment threads don't subscribe to their chat's action list.
    const isOneTransactionThread = useIsOneTransactionThread(isParentOneTransactionReport ? report : undefined);

    // The prev/next arrows only exist in a thread's header, so the flows that open a thread for them (Home "Recently
    // added", "Review N flagged expenses", the duplicate review list) would dead-end mid-review if we redirected.
    const parentReportAction = useParentReportAction(isParentOneTransactionReport ? report : undefined);
    const transactionID = getLinkedTransactionID(parentReportAction);
    const [siblingTransactionIDs] = useOnyx(ONYXKEYS.TRANSACTION_THREAD_NAVIGATION_TRANSACTION_IDS);

    // Mirrors the carousel's own render gate, plus a membership check so a stale sibling set left behind by another
    // report does not suppress a legitimate redirect.
    const isInActiveTransactionCarousel = !!transactionID && (siblingTransactionIDs?.length ?? 0) > 1 && !!siblingTransactionIDs?.includes(transactionID);

    // A message deep link points at an action inside the thread, so dropping the thread route would drop its anchor.
    const hasLinkedReportAction = !!redirectableRoute?.params?.reportActionID;

    // `referrer=notification` is what lets `useMarkAsRead` mark the report read without waiting on window focus, so it
    // has to survive the redirect. It only exists on the inbox route.
    const referrer = redirectableRoute?.name === SCREENS.REPORT ? redirectableRoute.params?.referrer : undefined;

    const shouldRedirectToParentReport = !!redirectableRoute && !!parentReportID && isParentOneTransactionReport && isOneTransactionThread;

    // Onyx updates can land before the replace finishes. Keyed by report so a later route onto another thread still
    // redirects.
    const redirectedFromReportIDRef = useRef<string | undefined>(undefined);

    // The app clears `reportActionID` on this route mid-session - jumping to the live tail after the user sends a
    // comment, or dropping an anchor whose action got deleted. Reading it live would redirect the user out of a thread
    // they are still reading, so latch how the route was opened instead. Keyed by report as above.
    const openedWithLinkedActionRef = useRef<{reportID: string | undefined; hadLinkedReportAction: boolean} | undefined>(undefined);

    // Deleting a *sibling* expense drops `transactionCount` to 1 optimistically, so reading it live would redirect out
    // of a thread the user is legitimately reading. Only the count at open time may authorize the redirect. Latched
    // once the count is known, so a cold open still redirects when the real count arrives.
    const openedWithParentTransactionCountRef = useRef<{reportID: string | undefined; transactionCount: number} | undefined>(undefined);

    // Sticky per report: the carousel clears its sibling set on unmount, so reading it live would let a redirect fire
    // late, out of a thread the user is still paging through.
    const suppressedForCarouselReportIDRef = useRef<string | undefined>(undefined);

    useEffect(() => {
        const latchedLinkedAction = openedWithLinkedActionRef.current;
        const openedWithLinkedAction =
            latchedLinkedAction && latchedLinkedAction.reportID === reportIDFromRoute ? latchedLinkedAction : {reportID: reportIDFromRoute, hadLinkedReportAction: hasLinkedReportAction};
        openedWithLinkedActionRef.current = openedWithLinkedAction;

        if (openedWithParentTransactionCountRef.current?.reportID !== reportIDFromRoute && parentTransactionCount !== undefined) {
            openedWithParentTransactionCountRef.current = {reportID: reportIDFromRoute, transactionCount: parentTransactionCount};
        }
        const openedWithParentTransactionCount = openedWithParentTransactionCountRef.current;
        const openedOnSingleExpenseReport =
            !!openedWithParentTransactionCount && openedWithParentTransactionCount.reportID === reportIDFromRoute && openedWithParentTransactionCount.transactionCount === 1;

        if (isInActiveTransactionCarousel) {
            suppressedForCarouselReportIDRef.current = reportIDFromRoute;
        }
        const isSuppressedForCarousel = !!reportIDFromRoute && suppressedForCarouselReportIDRef.current === reportIDFromRoute;

        if (
            !isFocused ||
            openedWithLinkedAction.hadLinkedReportAction ||
            isSuppressedForCarousel ||
            !openedOnSingleExpenseReport ||
            !shouldRedirectToParentReport ||
            redirectedFromReportIDRef.current === reportIDFromRoute
        ) {
            return;
        }
        redirectedFromReportIDRef.current = reportIDFromRoute;

        // The route's own `backTo`, not the active route - that points at the thread we are replacing.
        const backTo = redirectableRoute?.params?.backTo;

        // Replacing would stack `parent -> parent?backTo=parent`, so the first Back would appear to do nothing. Pop
        // onto the parent already on the stack instead.
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
    }, [
        isFocused,
        shouldRedirectToParentReport,
        hasLinkedReportAction,
        isInActiveTransactionCarousel,
        parentTransactionCount,
        reportIDFromRoute,
        parentReportID,
        redirectableRoute?.name,
        redirectableRoute?.params?.backTo,
        referrer,
    ]);

    return null;
}

OneTransactionThreadRedirectHandler.displayName = 'OneTransactionThreadRedirectHandler';

export default OneTransactionThreadRedirectHandler;
