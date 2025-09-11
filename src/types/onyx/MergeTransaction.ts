import type Transaction from './Transaction';
import type {Comment, Receipt} from './Transaction';

/** Model of transaction merge data */
type MergeTransaction = {
    /** Transaction ID we're keeping */
    targetTransactionID: string;

    /** ID of the transaction we're merging into that will be deleted */
    sourceTransactionID: string;

    /** API will set this to contain eligible transactions */
    eligibleTransactions: Transaction[];

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
};

export default MergeTransaction;
