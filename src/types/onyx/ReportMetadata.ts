type ReportMetadata = {
    /** Are we loading newer report actions? */
    isLoadingNewerReportActions?: boolean;

    /** Are we loading older report actions? */
    isLoadingOlderReportActions?: boolean;

    /** Flag to check if the report actions data are loading */
    isLoadingInitialReportActions?: boolean;
};

export default ReportMetadata;
