import type {Comment, WaypointCollection} from '@src/types/onyx/Transaction';

type SplitTransactionSplitParam = {
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
    quantity?: number;
    customUnitRateID?: string;
    odometerStart?: number;
    odometerEnd?: number;
    waypoints?: WaypointCollection;
};

type SplitTransactionSplitsParam = SplitTransactionSplitParam[];

type SplitTransactionParams = {
    transactionID: string;
    [key: string]: string | boolean;
};

type RevertSplitTransactionParams = Omit<SplitTransactionSplitParam, 'comment'> & {comment?: string};

export type {SplitTransactionParams, SplitTransactionSplitsParam, RevertSplitTransactionParams};
