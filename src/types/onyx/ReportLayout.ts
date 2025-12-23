import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';
import type Transaction from './Transaction';

/** User's report layout group-by preference */
type ReportLayoutGroupBy = ValueOf<typeof CONST.REPORT_LAYOUT.GROUP_BY>;

/** Grouped transactions for display */
type GroupedTransactions = {
    /** Display name of the group (category or tag name) */
    groupName: string;

    /** Key used for grouping (category or tag value) */
    groupKey: string;

    /** Transactions in this group */
    transactions: Transaction[];

    /** Subtotal amount for all transactions in this group */
    subTotalAmount: number;

    /** Whether the group is currently expanded */
    isExpanded: boolean;
};

export type {ReportLayoutGroupBy, GroupedTransactions};
