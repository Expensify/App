type SubmissionHandle = {
    createTransaction: (locationPermissionGranted?: boolean, shouldHandleNavigation?: boolean) => void;
};

type SendMoneyReportIDs = {
    /** Optimistic report ID generated before the server round-trip. */
    optimisticChatReportID: string | undefined;

    /** Resolved chat report ID (may match an existing report). */
    chatReportID: string | undefined;
};

type SendMoneyOptions = {
    /** Whether the send-money action should handle its own post-submit navigation. */
    shouldHandleNavigation?: boolean;

    /** Pre-resolved report IDs to avoid redundant resolution when the caller already resolved them. */
    resolvedReportIDs?: SendMoneyReportIDs;

    /** Whether to start telemetry tracking; false when the orchestrator starts tracking externally. */
    shouldStartTracking?: boolean;

    /** Whether to defer the API write for the Search skeleton optimization. */
    shouldDeferForSearch?: boolean;
};

export type {SubmissionHandle, SendMoneyOptions};
