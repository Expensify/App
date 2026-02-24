import type {TransactionDetails} from '@libs/ReportUtils';

type UpdateMoneyRequestParams = Partial<TransactionDetails> & {
    reportID?: string;
    transactionID?: string;
    reportActionID?: string;
};

export default UpdateMoneyRequestParams;
