type ReportActionItemStateContextType = {
    shouldOpenReportInRHP: boolean;
};

type ReportActionItemActionsContextType = {
    onPreviewPressed?: (reportID: string) => void;
};

export type {ReportActionItemStateContextType, ReportActionItemActionsContextType};
