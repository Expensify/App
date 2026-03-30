import type {TransactionDetails} from '@libs/ReportUtils';

type UpdateMoneyRequestParams = Partial<TransactionDetails> & {
    reportID?: string;
    transactionID?: string;
    reportActionID?: string;
    /** Used for bulk updates - JSON stringified object containing only changed fields */
    updates?: string;
};

export default UpdateMoneyRequestParams;
