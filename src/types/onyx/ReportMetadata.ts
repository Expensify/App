import type * as OnyxCommon from './OnyxCommon';

/** The pending member of report */
type PendingChatMember = {
    /** Account ID of the pending member */
    accountID: string;

    /** Action to be applied to the pending member of report */
    pendingAction: OnyxCommon.PendingAction;

    /** Collection of errors to show to the user */
    errors?: OnyxCommon.Errors;
};

/** Model of report metadata */
type ReportMetadata = {
    /** Whether the user has successfully opened a report at least once, or if it was created by this user */
    hasOnceLoadedReportActions?: boolean;

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

    /** Whether the current report is optimistic */
    isOptimisticReport?: boolean;

    /** Pending members of the report */
    pendingChatMembers?: PendingChatMember[];

    /** Whether the action is loading */
    isActionLoading?: boolean;

    /** Whether the report has violations or errors */
    errors?: OnyxCommon.Errors;
};

export default ReportMetadata;

export type {PendingChatMember};
