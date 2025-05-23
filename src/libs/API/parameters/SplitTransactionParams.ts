type SplitTransactionSplitsParam = Array<{
    amount: number;
    category?: string;
    tag?: string;
    created: string;
    merchant?: string;
    comment?: {
        comment?: string;
    };
    nameValuePairs?: {
        comment?: string;
    };
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
