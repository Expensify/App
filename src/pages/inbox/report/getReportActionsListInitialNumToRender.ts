type GetReportActionsListInitialNumToRenderParams = {
    numToRender: number;
    initialScrollKey?: string;
    shouldScrollToEndAfterLayout: boolean;
    hasCreatedActionAdded?: boolean;
    sortedVisibleReportActionsLength: number;
    isOffline: boolean;
    getInitialNumToRender: (numToRender: number) => number;
};

export default function getReportActionsListInitialNumToRender({
    numToRender,
    initialScrollKey,
    shouldScrollToEndAfterLayout,
    hasCreatedActionAdded,
    sortedVisibleReportActionsLength,
    isOffline,
    getInitialNumToRender,
}: GetReportActionsListInitialNumToRenderParams): number {
    if (shouldScrollToEndAfterLayout && (!hasCreatedActionAdded || isOffline)) {
        return sortedVisibleReportActionsLength;
    }

    if (initialScrollKey) {
        return getInitialNumToRender(numToRender);
    }

    return numToRender;
}
