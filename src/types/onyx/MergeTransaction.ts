import type {IOURequestType} from '@libs/actions/IOU';
import type {Attendee} from './IOU';
import type Transaction from './Transaction';
import type {Comment, Receipt, Routes, TransactionCustomUnit, WaypointCollection} from './Transaction';

/** Model of transaction merge data */
type MergeTransaction = {
    /** Transaction ID we're keeping */
    targetTransactionID: string;

    /** ID of the transaction we're merging into that will be deleted */
    sourceTransactionID: string;

    /** API will set this to contain eligible transactions */
    eligibleTransactions: Transaction[];

    /** Track which transaction was selected for each field (for persistence across page reloads) */
    selectedTransactionByField?: Partial<Record<string, string>>;

    /** Amount which user want to keep */
    amount: number;

    /** The currency the user wants to */
    currency: string;

    /** Merchant which user want to keep */
    merchant: string;

    /** Category  which user want to keep */
    category: string;

    /** Tag  which user want to keep */
    tag: string;

    /** Description  which user want to keep */
    description: string;

    /** NVPs of the transaction that we want to keep */
    comment: Comment;

    /** Whether the transaction is reimbursable */
    reimbursable: boolean;

    /** Whether the transaction is billable */
    billable: boolean;

    /** The receipt object associated with the transaction */
    receipt?: Receipt;

    /** The date of the transaction */
    created: string;

    /** The report ID of the transaction */
    reportID: string;

    /** The report name of the transaction */
    reportName: string;

    /** Custom unit data for distance requests */
    customUnit?: TransactionCustomUnit;

    /** Waypoints for distance requests */
    waypoints?: WaypointCollection;

    /** Routes for distance requests */
    routes?: Routes;

    /** The iou request type of the transaction */
    iouRequestType?: IOURequestType;

    /** The attendees of the transaction */
    attendees?: Attendee[];

    /** ID of the original transaction */
    originalTransactionID?: string;
};

export default MergeTransaction;
