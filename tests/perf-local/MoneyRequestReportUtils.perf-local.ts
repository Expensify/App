/**
 * Measures getAllNonDeletedTransactions as an expense report grows. Opening a report runs it in several hooks,
 * so its cost per call is paid many times on every open.
 */
import {getAllNonDeletedTransactions} from '@libs/MoneyRequestReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction, Transaction} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

import {measureFunction} from 'reassure';

import createRandomReportAction from '../utils/collections/reportActions';
import createRandomTransaction from '../utils/collections/transaction';

const REPORT_ID = '1';
const EXPENSE_COUNTS = [50, 100, 250, 500, 1000];

/** One expense action and one comment per expense, like a report people have talked about. */
function buildReport(expenseCount: number): {transactions: OnyxCollection<Transaction>; reportActions: ReportAction[]} {
    const transactions: OnyxCollection<Transaction> = {};
    const reportActions: ReportAction[] = [];
    for (let index = 1; index <= expenseCount; index++) {
        const transactionID = String(index);
        transactions[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`] = {
            ...createRandomTransaction(index),
            transactionID,
            reportID: REPORT_ID,
            pendingAction: null,
            errorFields: undefined,
        };
        reportActions.push({
            ...createRandomReportAction(index),
            reportActionID: `iou${index}`,
            actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
            pendingAction: null,
            message: [{type: 'COMMENT', html: '$1.00 expense', text: '$1.00 expense'}],
            // eslint-disable-next-line @typescript-eslint/no-deprecated -- getOriginalMessage reads the expense's IOUTransactionID from here
            originalMessage: {IOUTransactionID: transactionID, IOUReportID: REPORT_ID, type: CONST.IOU.REPORT_ACTION_TYPE.CREATE, amount: 100, currency: CONST.CURRENCY.USD},
        });
        reportActions.push({
            ...createRandomReportAction(expenseCount + index),
            reportActionID: `comment${index}`,
            actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
            pendingAction: null,
            message: [{type: 'COMMENT', html: 'comment', text: 'comment'}],
        });
    }
    return {transactions, reportActions};
}

describe('getAllNonDeletedTransactions', () => {
    for (const expenseCount of EXPENSE_COUNTS) {
        test(`[MoneyRequestReportUtils] getAllNonDeletedTransactions on a report with ${expenseCount} expenses`, async () => {
            // Given a report where every expense has its action and a comment
            const {transactions, reportActions} = buildReport(expenseCount);
            expect(getAllNonDeletedTransactions(transactions, reportActions, false, true)).toHaveLength(expenseCount);

            // When the report's expenses are read, like on every update while the report opens
            await measureFunction(() => getAllNonDeletedTransactions(transactions, reportActions, false, true));
            // Then reassure measures one call, which should grow only linearly with the expenses
        });
    }
});
