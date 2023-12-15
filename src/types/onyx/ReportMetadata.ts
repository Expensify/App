type ReportMetadata = {
    /** Are we loading newer report actions? */
    isLoadingNewerReportActions?: boolean;

    /** Are we loading older report actions? */
    isLoadingOlderReportActions?: boolean;

    /** Flag to check if the report actions data are loading */
    isLoadingInitialReportActions?: boolean;

    /** The time of the last visit of the report */
    lastVisitTime?: string;
};

export default ReportMetadata;
