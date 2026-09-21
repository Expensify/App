import type {IOURequestType} from '@src/CONST';
import type {FileObject} from '@src/types/utils/Attachment';

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

    reimbursable: boolean;
    billable: boolean;

    /** The receipt object associated with the transaction */
    receipt?: Receipt;

    /** The date of the transaction */
    created: string;

    reportID: string;
    reportName: string;

    /** Custom unit data for distance requests */
    customUnit?: TransactionCustomUnit;

    /** Waypoints for distance requests */
    waypoints?: WaypointCollection;

    /** Routes for distance requests */
    routes?: Routes;

    iouRequestType?: IOURequestType;

    /** Odometer start reading for distance expenses */
    odometerStart?: number;

    /** Odometer end reading for distance expenses */
    odometerEnd?: number;

    odometerStartImage?: FileObject | string;
    odometerEndImage?: FileObject | string;
    attendees?: Attendee[];
    originalTransactionID?: string;

    /** Tax percentage value of the transaction */
    taxValue: string;

    taxAmount: number;
    taxCode: string;

    /** Tax name to display in merge transaction flow */
    taxName: string;

    /** Policy ID of the selected tax rate for the transaction */
    taxPolicyID: string;
};

export default MergeTransaction;
