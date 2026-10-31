import type {Unit} from '@src/types/onyx/Policy';
import type {WaypointCollection} from '@src/types/onyx/Transaction';

type SplitTransactionSplitParam = {
    transactionID: string;
    amount: number;
    category?: string;
    tag?: string;
    created: string;
    merchant?: string;
    comment?: string;
    splitReportActionID?: string;
    transactionThreadReportID?: string;
    createdReportActionIDForThread?: string;
    modifiedExpenseReportActionID?: string;
    reimbursable?: boolean;
    billable?: boolean;
    taxCode?: string;
    taxAmount?: number;
    taxValue?: string;
    reportID?: string;
    quantity?: number;
    customUnitRateID?: string;
    distanceUnit?: Unit;
    odometerStart?: number;
    odometerEnd?: number;
    waypoints?: WaypointCollection;
    holdReportActionID?: string;
    holdReportActionCommentID?: string;
    /**
     * Maps the original comment reportActionID to the optimistic copied comment reportActionID.
     * Shape: {[originalReportActionID]: optimisticReportActionID}
     */
    copiedComments?: Record<string, string>;
};

type SplitTransactionSplitsParam = SplitTransactionSplitParam[];

type SplitTransactionParams = {
    transactionID: string;
    [key: string]: string | number | boolean;
};

type RevertSplitTransactionParams = Omit<SplitTransactionSplitParam, 'holdReportActionID' | 'holdReportActionCommentID' | 'copiedComments'> & {
    copiedComments?: string;
};

export type {SplitTransactionParams, SplitTransactionSplitsParam, RevertSplitTransactionParams};
