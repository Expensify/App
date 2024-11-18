/** Model of report metadata */
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

    /** Whether participants private notes are being currently loaded */
    isLoadingPrivateNotes?: boolean;
};

export default ReportMetadata;
