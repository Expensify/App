import type * as OnyxCommon from './OnyxCommon';

/** Model of report private note */
type Note = OnyxCommon.OnyxValueWithOfflineFeedback<{
    /** Content of the note */
    note: string;

    /** Collection of errors to show to the user */
    errors?: OnyxCommon.Errors;
}>;

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

    /** Collection of participant private notes, indexed by their accountID */
    privateNotes?: Record<number, Note>;
};

export default ReportMetadata;

export type {Note};
