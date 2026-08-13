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
}: GetSubmitExpensePreMountDestinationRouteParams): Route | undefined {
    // Unlike getSkipConfirmationPreMountDestinationRoute (which lets usePreMountDestination own the narrow gate), this builder
    // returns undefined on wide up front - it avoids the nav reads below, and reveal() would never consume a wide result anyway.
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
    const canUseReportPreInsert =
        !shouldPreInsertSearch &&
        (isReportTopmostSplitNavigator() || (!isSearchTopmostFullScreenRoute() && (isCreatingTrackExpense || isSelfDMDestination || isReportBoundGlobalCreate || !isFromGlobalCreate)));

    // RHP has its own dismiss handler; pre-inserting under it would break the stack.
    const isOutsideRHP = !isReportOpenInRHP(navigationRef.getRootState());
    // Don't pre-insert if the report is already the topmost fullscreen - it would push a duplicate route (extra back press).
    const hasValidDestination = !!destinationReportID && (hasPreInsertedFullscreen || Navigation.getTopmostReportId() !== destinationReportID);
    // Only pre-insert loaded reports because drafts can show an infinite skeleton after backing out. Employer-flow drafts
    // are promoted by the caller. Optimistic new chats are safe because submit reuses their reportID and no report row
    // exists yet. Passing an empty draft skips REPORT_DRAFT while preserving the module-cache fallback.
    const isDestinationReportLoaded =
        isOptimisticNewChatDestination || (!!destinationReportID && !!getReportOrDraftReport(destinationReportID, undefined, undefined, {}, destinationReport)?.reportID);
    const shouldPreInsertReport = canUseReportPreInsert && isOutsideRHP && hasValidDestination && isDestinationReportLoaded;

    if (!shouldPreInsertSearch && !shouldPreInsertReport) {
        return undefined;
    }

    if (shouldPreInsertSearch) {
        return ROUTES.SEARCH_ROOT.getRoute({
            query: buildCannedSearchQuery({type: searchType}),
        });
    }

    // isPendingCreation tells ReportFetchHandler to skip openReport for this ID until the real report exists locally
    // (see the isOptimisticNewChatDestination comment above) - openReport would 403 against a client-only ID and
    // latch the not-found page instead of leaving the pre-inserted screen in its normal loading state.
    const [reportActionID, referrer, backTo, secureKey] = [undefined, undefined, undefined, undefined];
    return ROUTES.REPORT_WITH_ID.getRoute(destinationReportID, reportActionID, referrer, backTo, secureKey, isOptimisticNewChatDestination);
}

export default getSubmitExpensePreMountDestinationRoute;
