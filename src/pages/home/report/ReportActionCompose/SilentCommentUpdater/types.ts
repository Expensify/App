type SilentCommentUpdaterProps = {
    /** Updates the comment */
    updateComment: (comment: string) => void;

    /** The ID of the report associated with the comment */
    reportID: string;

    /** The value of the comment */
    value: string;

    /** The ref of the comment */
    commentRef: React.RefObject<string>;

    /** The ref to check whether the comment saving is in progress */
    isCommentPendingSaved: React.RefObject<boolean>;

    /** The ref to check whether we're transitioning to a preexisting report */
    isTransitioningToPreExistingReport: React.RefObject<boolean>;

    /** Callback to clear the transitioning flag after transition to preexisting report is complete */
    onTransitionToPreExistingReportComplete: () => void;
};

export default SilentCommentUpdaterProps;
