type GetReportActionsListInitialNumToRenderParams = {
    numToRender: number;
    linkedReportActionID?: string;
    shouldScrollToEndAfterLayout: boolean;
    hasCreatedActionAdded?: boolean;
    sortedVisibleReportActionsLength: number;
    isOffline: boolean;
    getInitialNumToRender: (numToRender: number) => number;
};

export default function getReportActionsListInitialNumToRender({
    numToRender,
    linkedReportActionID,
    shouldScrollToEndAfterLayout,
    hasCreatedActionAdded,
    sortedVisibleReportActionsLength,
    isOffline,
    getInitialNumToRender,
}: GetReportActionsListInitialNumToRenderParams): number | undefined {
    if (shouldScrollToEndAfterLayout && (!hasCreatedActionAdded || isOffline)) {
        return sortedVisibleReportActionsLength;
    }

    if (linkedReportActionID) {
        return getInitialNumToRender(numToRender);
    }

    return numToRender || undefined;
}
