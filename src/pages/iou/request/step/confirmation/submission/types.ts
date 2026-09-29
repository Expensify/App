import type {WriteReadyBarrier} from '@libs/API';

type CreateTransactionParams = {
    /** Whether the user granted the location permission, which decides if GPS coordinates are attached to a scan. */
    locationPermissionGranted?: boolean;

    /** Whether the submission handler should handle its own post-submit navigation. */
    shouldHandleNavigation?: boolean;

    /** What the resulting API write waits on before applying its optimistic data. */
    writeBarrier?: WriteReadyBarrier;
};

type SubmissionHandle = {
    /** Submission entry point implemented by each submission-path variant. */
    createTransaction: (params: CreateTransactionParams) => boolean;
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
};

export type {SubmissionHandle, SendMoneyOptions, CreateTransactionParams};
