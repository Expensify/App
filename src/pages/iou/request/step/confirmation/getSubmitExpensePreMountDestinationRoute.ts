import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import isReportOpenInRHP from '@libs/Navigation/helpers/isReportOpenInRHP';
import isReportTopmostSplitNavigator from '@libs/Navigation/helpers/isReportTopmostSplitNavigator';
import isSearchTopmostFullScreenRoute from '@libs/Navigation/helpers/isSearchTopmostFullScreenRoute';
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import {getReportOrDraftReport} from '@libs/ReportUtils';
import {buildCannedSearchQuery, getCurrentSearchQueryJSON} from '@libs/SearchQueryUtils';

import CONST from '@src/CONST';
import type {IOUType} from '@src/CONST';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import type Report from '@src/types/onyx/Report';

import getSubmitExpenseSearchType from './getSubmitExpenseSearchType';

type GetSubmitExpensePreMountDestinationRouteParams = {
    isTransactionReady: boolean;
    destinationReportID: string | undefined;
    destinationReport: Report | undefined;
    isFromGlobalCreate: boolean;
    canPreInsertSearch: boolean;
    iouType: IOUType;
    isCreatingTrackExpense: boolean;
    isSelfDMDestination: boolean;
    isOptimisticNewChatDestination: boolean;
    isLookingAroundUser: boolean;
    /** Whether the flow relocates an already-tracked expense (SUBMIT/SHARE/CATEGORIZE) rather than creating one in place. */
    isMovingTransactionFromTrackExpense: boolean;
};

/**
 * Returns the fullscreen route to pre-mount behind the expense confirmation RHP on narrow layout,
 * or undefined when pre-insert is not eligible for the current navigation topology.
 */
function getSubmitExpensePreMountDestinationRoute({
    isTransactionReady,
    destinationReportID,
    destinationReport,
    isFromGlobalCreate,
    canPreInsertSearch,
    iouType,
    isCreatingTrackExpense,
    isSelfDMDestination,
    isOptimisticNewChatDestination,
    isLookingAroundUser,
    isMovingTransactionFromTrackExpense,
}: GetSubmitExpensePreMountDestinationRouteParams): Route | undefined {
    // Bail out early on wide layout: nothing here is ever shown on wide, so skip the navigation reads below entirely.
    if (!isTransactionReady || !getIsNarrowLayout()) {
        return undefined;
    }

    // Once this route has been pre-inserted, our own pre-insertion mutates the live navigation state
    // (getTopmostReportId / isSearchTopmostFullScreenRoute now reflect the pre-inserted fullscreen). Re-deriving
    // eligibility from that mutated state would flip the result to "not eligible" and cause the hook to tear down
    // the route it just inserted. Treat an existing pre-insert as still-eligible so the result stays stable.
    const hasPreInsertedFullscreen = Navigation.getIsFullscreenPreInsertedUnderRHP();

    // Search pre-insert: global-create flows that navigate to Search after submit. Also pre-insert when Search is already on
    // top but showing a different type (e.g. Invoice tab when submitting an Expense) so the correct tab is revealed on dismiss.
    const searchType = getSubmitExpenseSearchType(iouType);
    const isSearchOnTopWithDifferentType = isSearchTopmostFullScreenRoute() && getCurrentSearchQueryJSON()?.type !== searchType;
    const shouldPreInsertSearch =
        isFromGlobalCreate && canPreInsertSearch && !isReportTopmostSplitNavigator() && (!isSearchTopmostFullScreenRoute() || isSearchOnTopWithDifferentType || hasPreInsertedFullscreen);

    // Report pre-insert: dismiss-modal flows that open an existing report after submit. Only eligible when search pre-insert
    // didn't win and the flow ends at a report (not Search). When Search is topmost with no report context (e.g. QAB from the
    // Spend tab) pre-inserting a report is wrong - the user should stay on Search. Global-create TRACK targets self-DM, PAY/SPLIT
    // target a specific chat report, and a self-DM CREATE is effectively a TRACK, so all are eligible when Search is NOT topmost.
    const isReportBoundGlobalCreate = iouType === CONST.IOU.TYPE.PAY || iouType === CONST.IOU.TYPE.SPLIT;
    // Never pre-insert the self-DM report for a LOOKING_AROUND self-DM create - it routes to Search, and pre-inserting would
    // strand the user on the self-DM. Scoped to isSelfDMDestination so other destinations still get pre-inserted.
    const canUseReportPreInsert =
        !shouldPreInsertSearch &&
        !(isFromGlobalCreate && isLookingAroundUser && isSelfDMDestination) &&
        (isReportTopmostSplitNavigator() || (!isSearchTopmostFullScreenRoute() && (isCreatingTrackExpense || isSelfDMDestination || isReportBoundGlobalCreate || !isFromGlobalCreate)));

    // RHP has its own dismiss handler; pre-inserting under it would break the stack.
    const isOutsideRHP = !isReportOpenInRHP(navigationRef.getRootState());
    // Don't pre-insert if the report is already the topmost fullscreen - it would push a duplicate route (extra back press).
    const hasValidDestination = !!destinationReportID && (hasPreInsertedFullscreen || Navigation.getTopmostReportId() !== destinationReportID);
    // A report destination while a *different* report is topmost has no tab to switch to, so the pre-insert overwrites the
    // visible report and cancelling must rebuild it from a state snapshot - a restore the root router's guards can silently
    // swallow (#97437). Relocating a tracked expense is where that bites: it is rebound to its destination chat before this
    // screen opens, so the destination is a report the user has never been on. Skipping it costs only the pre-mount.
    const isReplacingVisibleReport =
        !hasPreInsertedFullscreen && isMovingTransactionFromTrackExpense && isReportTopmostSplitNavigator() && Navigation.getTopmostReportId() !== destinationReportID;
    // Passing {} as the draft argument only blocks the REPORT_DRAFT collection fallback. A draft the caller
    // passes in via destinationReport still resolves here, because getReportOrDraftReport checks its `report`
    // slot before falling back to the draft slot - and that is intentional: the caller copies that draft into
    // COLLECTION.REPORT before reveal, so it is safe to treat as renderable.
    const isDestinationReportRenderable = !!destinationReportID && !!getReportOrDraftReport(destinationReportID, undefined, undefined, {}, destinationReport)?.reportID;
    // Only pre-insert a report that's actually renderable - a report that resolves to neither a loaded report
    // nor a pre-mounted draft can show an infinite skeleton after backing out.
    // An optimistic new chat is the one exception: it has no report row yet, but that's fine since submit
    // will create it under this same ID.
    const isDestinationReportLoaded = isOptimisticNewChatDestination || isDestinationReportRenderable;
    const shouldPreInsertReport = canUseReportPreInsert && isOutsideRHP && hasValidDestination && isDestinationReportLoaded && !isReplacingVisibleReport;

    if (!shouldPreInsertSearch && !shouldPreInsertReport) {
        return undefined;
    }

    if (shouldPreInsertSearch) {
        return ROUTES.SEARCH_ROOT.getRoute({
            query: buildCannedSearchQuery({type: searchType}),
        });
    }

    // The last argument tells the report screen this ID is client-generated and doesn't exist on the server
    // yet, so it should keep showing its normal loading state instead of fetching (which would 403 and show
    // a not-found page). The other arguments in between aren't used for this route.
    return ROUTES.REPORT_WITH_ID.getRoute(destinationReportID, undefined, undefined, undefined, undefined, isOptimisticNewChatDestination);
}

export default getSubmitExpensePreMountDestinationRoute;
