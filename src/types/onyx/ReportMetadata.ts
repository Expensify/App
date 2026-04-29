import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';
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
};

export default ReportMetadata;

export type {PendingChatMember};
