import CONST from '@src/CONST';

const INITIAL_TARGET_REPORT_ACTION_ESTIMATED_HEIGHT = CONST.CHAT_SKELETON_VIEW.AVERAGE_ROW_HEIGHT;
const INITIAL_VIEWPORT_OVERSCAN_ITEMS = 2;

type InitialViewportRange = {
    first: number;
    last: number;
    requiredMountedItems: number;
};

type InitialViewportResetSession = {
    listID: string;
    reportID: string;
    linkedReportActionID: string | undefined;
    initialScrollKey: string | undefined;
};

function isUnreadMarkerOnlyInitialScrollKeyChange(
    previousSession: InitialViewportResetSession | undefined,
    listID: string,
    reportID: string,
    linkedReportActionID: string | undefined,
    initialScrollKey: string | undefined,
) {
    if (!previousSession || linkedReportActionID) {
        return false;
    }

    const didUnreadMarkerChange = previousSession.initialScrollKey !== initialScrollKey;
    const isSameListSession = previousSession.listID === listID && previousSession.reportID === reportID && previousSession.linkedReportActionID === linkedReportActionID;

    return didUnreadMarkerChange && isSameListSession;
}

function isInitialViewportCovered(mountedIndices: Set<number>, range: InitialViewportRange, initialScrollIndex: number) {
    if (mountedIndices.size < range.requiredMountedItems) {
        return false;
    }

    const mountedIndexList = Array.from(mountedIndices);
    const hasItemBeforeInitialTarget = range.first >= initialScrollIndex || mountedIndexList.some((index) => index < initialScrollIndex);
    const hasItemAfterInitialTarget = range.last <= initialScrollIndex || mountedIndexList.some((index) => index > initialScrollIndex);

    return hasItemBeforeInitialTarget && hasItemAfterInitialTarget;
}

/**
 * Inverted FlashList `scrollToIndex` with `-listHeight / 2` places the row's bottom edge at mid-viewport.
 * Adjust from that baseline to land either the row's top edge or vertical center on mid-viewport.
 */
function getMeasuredLinkedRowScrollViewOffset(listHeight: number, layoutHeight: number) {
    const midViewportOffset = -listHeight / 2;

    if (layoutHeight > listHeight) {
        return midViewportOffset + layoutHeight;
    }

    return midViewportOffset + layoutHeight / 2;
}

function computeInitialViewportRange(listHeight: number, initialScrollIndex: number, visibleActionCount: number): InitialViewportRange | undefined {
    if (listHeight <= 0 || initialScrollIndex < 0) {
        return undefined;
    }

    const estimatedVisibleReportActions = Math.max(1, Math.ceil(listHeight / INITIAL_TARGET_REPORT_ACTION_ESTIMATED_HEIGHT));
    const radius = Math.ceil(estimatedVisibleReportActions / 2) + INITIAL_VIEWPORT_OVERSCAN_ITEMS;
    const first = Math.max(initialScrollIndex - radius, 0);
    const last = Math.min(initialScrollIndex + radius, visibleActionCount - 1);

    return {
        first,
        last,
        requiredMountedItems: Math.min(estimatedVisibleReportActions, last - first + 1),
    };
}

function findInitialScrollIndex<T>(sortedVisibleReportActions: T[], keyExtractor: (item: T) => string, initialScrollKey: string | undefined) {
    if (!initialScrollKey) {
        return -1;
    }

    return sortedVisibleReportActions.findIndex((item) => keyExtractor(item) === initialScrollKey);
}

export type {InitialViewportRange, InitialViewportResetSession};
export {computeInitialViewportRange, findInitialScrollIndex, getMeasuredLinkedRowScrollViewOffset, isInitialViewportCovered, isUnreadMarkerOnlyInitialScrollKeyChange};
