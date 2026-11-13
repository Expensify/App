import type CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

import type {PaymentMethodType} from './OriginalMessage';

/** Possible states of a bulk action */
type BulkActionState = ValueOf<typeof CONST.BULK_ACTION.STATE>;

/** Why a bulk bank payment left a report unpaid */
type BulkPaySkipReason = ValueOf<typeof CONST.BULK_ACTION.SKIP_REASON>;

/** Bulk actions from Search "Select all" that run on the backend */
type BulkActionType =
    | typeof CONST.SEARCH.BULK_ACTION_TYPES.APPROVE
    | typeof CONST.SEARCH.BULK_ACTION_TYPES.SUBMIT
    | typeof CONST.SEARCH.BULK_ACTION_TYPES.PAY
    | typeof CONST.SEARCH.BULK_ACTION_TYPES.HOLD
    | typeof CONST.SEARCH.BULK_ACTION_TYPES.UNHOLD
    | typeof CONST.SEARCH.BULK_ACTION_TYPES.REJECT
    | typeof CONST.SEARCH.BULK_ACTION_TYPES.DELETE
    | typeof CONST.BULK_ACTION.DELETE_EXPENSES
    | typeof CONST.SEARCH.BULK_ACTION_TYPES.CHANGE_WORKSPACE;

/** Model of a bulk action started from Search "Select all" */
type BulkAction = {
    state: BulkActionState;

    /** Which action is running on the matching reports */
    action: BulkActionType;

    /** Number of reports the action ran on, set once it is done */
    total?: number;

    /** Reports the action couldn't be done on, set once it is done */
    failedReportIDs?: string[];

    /** How a bulk payment pays the reports, set when it pays through a bank account instead of marking them as paid */
    paymentType?: PaymentMethodType;

    /** Reports a bank payment left unpaid on purpose, grouped by why, set once it is done. The backend can add a reason the App doesn't know yet. */
    skippedReportIDs?: Partial<Record<BulkPaySkipReason, string[]>>;

    /** Whether Concierge should message the result instead of showing it here */
    shouldSendFromConcierge?: boolean;
};

export default BulkAction;
export type {BulkActionType, BulkPaySkipReason};
