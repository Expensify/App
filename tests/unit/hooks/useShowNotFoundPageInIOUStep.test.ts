import {renderHook} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import useShowNotFoundPageInIOUStep from '@hooks/useShowNotFoundPageInIOUStep';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction, Transaction} from '@src/types/onyx';
import createRandomReportAction from '../../utils/collections/reportActions';
import {createRandomReport} from '../../utils/collections/reports';
import createRandomTransaction from '../../utils/collections/transaction';

describe('useShowNotFoundPageInIOUStep', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
        });
    });

    it('should return false for report approver/manager', async () => {
        // Given an expense report and current user as the approver
        const currentUserAccountID = 123;
        const iouReport: Report = {
            ...createRandomReport(0, undefined),
            type: CONST.REPORT.TYPE.EXPENSE,
            managerID: currentUserAccountID,
        };
        const moneyRequestAction: ReportAction = {
            ...createRandomReportAction(3),
            actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
            originalMessage: {
                IOUReportID: iouReport.reportID,
                type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
            },
        };
        const transactionThread: Report = {
            ...createRandomReport(1, undefined),
            parentReportID: iouReport.reportID,
            parentReportActionID: moneyRequestAction.reportActionID,
        };
        const transaction: Transaction = {
            ...createRandomTransaction(3),
            reportID: iouReport.reportID,
        };
        await Onyx.merge(ONYXKEYS.SESSION, {accountID: currentUserAccountID});
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${iouReport.reportID}`, iouReport);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThread.parentReportID}`, {
            [moneyRequestAction.reportActionID]: moneyRequestAction,
        });

        // Then not found page should not be shown when editing the expense
        const {result} = renderHook(() => useShowNotFoundPageInIOUStep(CONST.IOU.ACTION.EDIT, CONST.IOU.TYPE.CREATE, undefined, transactionThread, transaction));
        expect(result.current).toBe(false);
    });
});
