import type CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

/** Possible states of a bulk action */
type BulkActionState = ValueOf<typeof CONST.BULK_ACTION.STATE>;

/** Bulk actions from Search "Select all" that run on the backend */
type BulkActionType =
    | typeof CONST.SEARCH.BULK_ACTION_TYPES.APPROVE
    | typeof CONST.SEARCH.BULK_ACTION_TYPES.SUBMIT
    | typeof CONST.SEARCH.BULK_ACTION_TYPES.PAY
    | typeof CONST.SEARCH.BULK_ACTION_TYPES.HOLD
    | typeof CONST.SEARCH.BULK_ACTION_TYPES.UNHOLD
    | typeof CONST.SEARCH.BULK_ACTION_TYPES.REJECT;

/** Model of a bulk action started from Search "Select all" */
type BulkAction = {
    state: BulkActionState;

    /** Which action is running on the matching reports */
    action: BulkActionType;

    /** Number of reports the action ran on, set once it is done */
    total?: number;

    /** Reports the action couldn't be done on, set once it is done */
    failedReportIDs?: string[];

    /** Whether Concierge should message the result instead of showing it here */
    shouldSendFromConcierge?: boolean;
};

export default BulkAction;
export type {BulkActionType};
