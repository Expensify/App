import type {Comment} from '@src/types/onyx/Transaction';

type SplitTransactionSplitsParam = Array<{
    amount: number;
    transactionID: string;
    reportID: string;
    category?: string;
    tag?: string;
    created: string;
    merchant?: string;
    comment?: Comment;
    splitReportActionID?: string;
    transactionThreadReportID?: string;
    createdReportActionIDForThread?: string;
    reimbursable?: boolean;
    billable?: boolean;
}>;

type SplitTransactionParams = {
    transactionID: string;
    [key: string]: string | boolean;
};

export type {SplitTransactionParams, SplitTransactionSplitsParam};
