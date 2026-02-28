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
    const numToRenderWithPlatformAdjustments = linkedReportActionID ? getInitialNumToRender(numToRender) : numToRender;

    if (shouldScrollToEndAfterLayout && (!hasCreatedActionAdded || isOffline)) {
        return Math.min(numToRenderWithPlatformAdjustments, sortedVisibleReportActionsLength) || undefined;
    }

    return numToRenderWithPlatformAdjustments || undefined;
}
