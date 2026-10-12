import {renderHook, waitFor} from '@testing-library/react-native';

import useSingleExpenseReportView from '@hooks/useSingleExpenseReportView';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import createMock from '../../utils/createMock';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

const REPORT_ID = '1';
const REPORT_ACTION_ID = '10';

function buildIOUAction(type: typeof CONST.IOU.REPORT_ACTION_TYPE.CREATE | typeof CONST.IOU.REPORT_ACTION_TYPE.PAY): ReportAction {
    return createMock<ReportAction>({
        reportActionID: REPORT_ACTION_ID,
        actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
        originalMessage: {
            type,
            IOUTransactionID: '100',
            ...(type === CONST.IOU.REPORT_ACTION_TYPE.PAY && {IOUDetails: {amount: 100, comment: '', currency: CONST.CURRENCY.USD}}),
        },
    });
}

describe('useSingleExpenseReportView', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await Onyx.set(ONYXKEYS.NVP_SINGLE_EXPENSE_REPORT_VIEW, CONST.REPORT_LAYOUT.SINGLE_EXPENSE_REPORT_VIEW.TABLE);
        await waitForBatchedUpdates();
    });

    it('uses the table view for a single-expense report when the user picked it', async () => {
        // Given the user picked the table view and the report's expense comes from a regular expense action
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`, {[REPORT_ACTION_ID]: buildIOUAction(CONST.IOU.REPORT_ACTION_TYPE.CREATE)});
        await waitForBatchedUpdates();

        // When the view is read for that report
        const {result} = renderHook(() => useSingleExpenseReportView(REPORT_ID));

        // Then the report uses the table view
        await waitFor(() => expect(result.current.shouldUseTableViewForSingleExpense).toBe(true));
    });

    it('uses the expense view for a "Pay someone" report even when the user picked the table view', async () => {
        // Given the user picked the table view and the report is a "Pay someone" report
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`, {[REPORT_ACTION_ID]: buildIOUAction(CONST.IOU.REPORT_ACTION_TYPE.PAY)});
        await waitForBatchedUpdates();

        // When the view is read for that report
        const {result} = renderHook(() => useSingleExpenseReportView(REPORT_ID));

        // Then the report keeps the expense view, because it has no expense thread for a table row to open,
        // while the saved preference itself is unchanged
        await waitFor(() => expect(result.current.singleExpenseReportView).toBe(CONST.REPORT_LAYOUT.SINGLE_EXPENSE_REPORT_VIEW.TABLE));
        expect(result.current.shouldUseTableViewForSingleExpense).toBe(false);
    });
});
