import type {Comment} from '@src/types/onyx/Transaction';

type SplitTransactionSplitsParam = Array<{
    amount: number;
    transactionID: string;
    category?: string;
    tag?: string;
    created: string;
    merchant?: string;
    comment?: Comment;
    splitReportActionID?: string;
    transactionThreadReportID?: string;
    createdReportActionIDForThread?: string;
    modifiedExpenseReportActionID?: string;
    reimbursable?: boolean;
    billable?: boolean;
    reportID?: string;
}>;

type SplitTransactionParams = {
    transactionID: string;
    [key: string]: string | boolean;
};

export type {SplitTransactionParams, SplitTransactionSplitsParam};
