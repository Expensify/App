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

// `RHPReportScreen` also backs `SCREENS.RIGHT_MODAL.AGENT_REPORT`. Redirecting from there would eject the user out of
// the modal, so this handler opts in by route name instead of assuming every screen that mounts it is redirectable.
type ReportScreenRoute =
    | PlatformStackRouteProp<ReportsSplitNavigatorParamList, typeof SCREENS.REPORT>
    | PlatformStackRouteProp<RightModalNavigatorParamList, typeof SCREENS.RIGHT_MODAL.SEARCH_REPORT>
    | PlatformStackRouteProp<RightModalNavigatorParamList, typeof SCREENS.RIGHT_MODAL.AGENT_REPORT>;

function selectTransactionCount(report: OnyxEntry<Report>): number | undefined {
    return report?.transactionCount;
}

// A report action ID is always a numeric string, so this tells the optional `:reportActionID` anchor apart from the
// path segment of a sub-route that merely happens to be nested under the report.
const REPORT_ACTION_ID_SEGMENT = /^\d+$/;

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
    // Only `REPORT_WITH_ID` and `SEARCH_REPORT` end in an optional `:reportActionID`; `SEARCH_MONEY_REQUEST_REPORT`
    // and `EXPENSE_REPORT_RHP` are the bare report, so nothing may follow them.
    const parentReportRoutes: Array<{path: string; hasOptionalReportActionID: boolean}> = [
        {path: ROUTES.REPORT_WITH_ID.getRoute(parentReportID), hasOptionalReportActionID: true},
        {path: ROUTES.SEARCH_REPORT.getRoute({reportID: parentReportID}), hasOptionalReportActionID: true},
        {path: ROUTES.SEARCH_MONEY_REQUEST_REPORT.getRoute({reportID: parentReportID}), hasOptionalReportActionID: false},
        {path: ROUTES.EXPENSE_REPORT_RHP.getRoute({reportID: parentReportID}), hasOptionalReportActionID: false},
    ];

    // `backTo` is captured with `Navigation.getActiveRoute()`, so it can carry the `:reportActionID` anchor -
    // `cleanStaleReportActionBackToParam` exists to rewrite exactly that shape - and `/r/<parent>/<actionID>` still
    // renders the parent, so that one trailing segment is accepted. Anything else nested under the report is a
    // different screen: `createDynamicRoute` builds dynamic modals as `<activeRoute>/<suffix>`, so a bare prefix match
    // would treat `/r/<parent>/duplicates/review/<thread>` as the parent and pop the user back into the review page
    // they just came from.
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
    // unrecoverable. Read as the raw count rather than as a boolean so the effect below can tell "the parent has not
    // loaded yet" apart from "the parent holds more than one expense".
    const [parentTransactionCount] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${parentReportID}`, {selector: selectTransactionCount});
    const isParentOneTransactionReport = parentTransactionCount === 1;

    // The same definition `HeaderView` and `SidebarUtils` use, so the redirect and the views that render the thread
    // agree. Gated on the parent's transaction count first: without it every plain comment thread would subscribe to
    // its chat's entire report action list. Passing `undefined` keeps the hook call unconditional but inert.
    const isOneTransactionThread = useIsOneTransactionThread(isParentOneTransactionReport ? report : undefined);

    // The prev/next carousel lives only in `MoneyRequestHeader`, which only a transaction thread renders - the parent
    // report gets `MoneyReportHeader` and no arrows. So every flow that seeds a *cross-report* sibling set and opens a
    // thread for the arrows (Home "Recently added", "Review N flagged expenses", the duplicate review list) would lose
    // them the moment one sibling happens to be alone on its report, dead-ending the carousel mid-review. Sibling sets
    // are written before the thread route is opened, so they are already in Onyx by the time this mounts.
    const parentReportAction = useParentReportAction(isParentOneTransactionReport ? report : undefined);
    const transactionID = getLinkedTransactionID(parentReportAction);
    const [siblingTransactionIDs] = useOnyx(ONYXKEYS.TRANSACTION_THREAD_NAVIGATION_TRANSACTION_IDS);

    // Mirrors the carousel's own render gate (it bails below two siblings), plus a membership check so a sibling set
    // left behind by an unrelated report does not suppress a legitimate redirect.
    const isInActiveTransactionCarousel = !!transactionID && (siblingTransactionIDs?.length ?? 0) > 1 && !!siblingTransactionIDs?.includes(transactionID);

    // A message deep link points at an action inside the thread, so dropping the thread route would drop its anchor.
    const hasLinkedReportAction = !!redirectableRoute?.params?.reportActionID;

    // A push notification opens its target with `referrer=notification`, which is what lets `useMarkAsRead` mark the
    // report read without waiting on window focus, so it has to survive the redirect. It only exists on the inbox route.
    const referrer = redirectableRoute?.name === SCREENS.REPORT ? redirectableRoute.params?.referrer : undefined;

    const shouldRedirectToParentReport = !!redirectableRoute && !!parentReportID && isParentOneTransactionReport && isOneTransactionThread;

    // The replace unmounts this screen, but Onyx updates can land before the transition finishes. Keyed by report so a
    // later route onto a different thread still redirects.
    const redirectedFromReportIDRef = useRef<string | undefined>(undefined);

    // `reportActionID` is mutable, and the app clears it on this very route while the user is still reading the
    // thread - jumping to the live tail once they send a comment (`useReportActionsNewActionLiveTail`), or dropping an
    // anchor whose action got deleted (`LinkedActionNotFoundGuard`). Reading it live would turn either into a redirect
    // that ejects the user mid-session, so latch how the route was opened instead. Keyed by report, because this
    // handler is not remounted when a later route swaps the screen's `reportID` for another thread.
    const openedWithLinkedActionRef = useRef<{reportID: string | undefined; hadLinkedReportAction: boolean} | undefined>(undefined);

    // `transactionCount` is merged optimistically when an expense is deleted (see `Transaction.ts`), so a report whose
    // thread the user is legitimately reading drops from many expenses to one the moment a *sibling* expense is
    // deleted. Reading the count live would then redirect mid-read, and the replace drops the thread route so Back
    // does not undo it. Only the count the parent had when this thread was opened may authorize the redirect. Keyed by
    // report as above, and latched only once the count is known - `undefined` means the parent has not loaded yet, so
    // a cold open still redirects when the real count arrives.
    const openedWithParentTransactionCountRef = useRef<{reportID: string | undefined; transactionCount: number} | undefined>(undefined);

    // Sticky per report: the carousel clears its sibling set when it unmounts, so reading it live would let a redirect
    // fire late and eject the user out of a thread they are still paging through.
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
