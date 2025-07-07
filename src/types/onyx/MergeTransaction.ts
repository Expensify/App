import type Transaction from './Transaction';
import type {Comment} from './Transaction';

/** Model of transaction merge data */
type MergeTransaction = {
    /** Transactions ID we're keeping */
    targetTransactionID: string[];

    /** ID of the transaction we're merging into that will be deleted */
    sourceTransactionID: string;

    /** API will set this to contain eligible transactions */
    eligibleTransactions: Transaction[];

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

    /** The receiptID we want to keep */ 
    receiptID: string;
};

export default MergeTransaction; 