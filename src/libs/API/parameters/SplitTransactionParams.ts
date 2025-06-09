import type {Comment} from '@src/types/onyx/Transaction';

type SplitTransactionSplitsParam = Array<{
    amount: number;
    category?: string;
    tag?: string;
    created: string;
    merchant?: string;
    comment?: Comment;
    splitReportActionID?: string;
    transactionThreadReportID?: string;
    createdReportActionIDForThread?: string;
}>;

type SplitTransactionParams = {
    transactionID: string;
    isReverseSplitOperation: boolean;
    [key: string]: string | boolean;
};

export type {SplitTransactionParams, SplitTransactionSplitsParam};
