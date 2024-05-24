type ReportMetadataPage = {
    /** The first report action ID in the page. Null indicates that it is the first page. */
    firstReportActionID: string | null;
    /** The last report action ID in the page. Null indicates that it is the last page. */
    lastReportActionID: string | null;
};

type ReportMetadata = {
    /** Are we loading newer report actions? */
    isLoadingNewerReportActions?: boolean;

    /** Was there an error when loading newer report actions? */
    hasLoadingNewerReportActionsError?: boolean;

    /** Are we loading older report actions? */
    isLoadingOlderReportActions?: boolean;

    /** Was there an error when loading older report actions? */
    hasLoadingOlderReportActionsError?: boolean;

    /** Flag to check if the report actions data are loading */
    isLoadingInitialReportActions?: boolean;

    /** The time when user last visited the report */
    lastVisitTime?: string;

    /** Pagination info */
    pages?: ReportMetadataPage[];
};

export type {ReportMetadata, ReportMetadataPage};
