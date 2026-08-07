import type CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

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

/** Per-report business state. Loading flags, pagination cursors, and last-visit timestamps
 *  are tracked in dedicated Onyx keys (RAM_ONLY_REPORT_LOADING_STATE, REPORT_PAGINATION_STATE,
 *  REPORT_LAST_VISIT_TIMES) and are NOT part of this type. */
type ReportMetadata = {
    /** Whether the current report is optimistic */
    isOptimisticReport?: boolean;

    /** Pending members of the report */
    pendingChatMembers?: PendingChatMember[];

    /** Whether the report has violations or errors */
    errors?: OnyxCommon.Errors;

    /** Pending expense action for DEW policies (e.g., SUBMIT or APPROVE in progress) */
    pendingExpenseAction?: ValueOf<typeof CONST.EXPENSE_PENDING_ACTION>;

    /** Transaction IDs that were just submitted/moved to this report and should be highlighted on first load */
    pendingNewTransactionIDs?: Record<string, true | null>;

    /**
     * Time window in which the current user's read state is unconfirmed after an offline replay.
     * Set when a queued offline ReadNewestAction's stale lastReadTime is bumped forward to the
     * server-assigned time of the user's own offline comment: another user's message can have
     * reached the server inside that window (while this device was offline) without the current
     * user ever seeing it, so the bumped read time can't be trusted to have covered it. Unread
     * logic checks actual report actions against this window instead of guessing from clocks.
     * `from` is the stale read time the queued request originally carried (exclusive), `to` is
     * the bumped time (inclusive). Cleared on a genuine online read, which reflects the
     * fully-synced report state. Client-only bookkeeping — never sent to or received from the
     * server, which is why it lives here rather than on the report itself.
     */
    unconfirmedReadWindow?: {
        /** The stale read time the queued offline read originally carried (exclusive lower bound) */
        from: string;

        /** The server time of the user's own offline comment the read was bumped to (inclusive upper bound) */
        to: string;
    } | null;
};

export default ReportMetadata;

export type {PendingChatMember};
