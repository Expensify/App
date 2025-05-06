type SplitTransactionSplitsParam = Array<{
    amount: number;
    category?: string;
    tag?: string;
    created: string;
    merchant?: string;
    comments?: {
        comment?: string;
    };
    splitReportActionID?: string;
    transactionThreadReportID?: string;
    createdReportActionIDForThread?: string;
}>;

type SplitTransactionParams = {
    transactionID: string;
    splits: string;
    isReverseSplitOperation: boolean;
};

export type {SplitTransactionParams, SplitTransactionSplitsParam};
