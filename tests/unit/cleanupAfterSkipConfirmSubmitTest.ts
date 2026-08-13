import cleanupAfterExpenseCreate from '@libs/Navigation/helpers/cleanupAfterExpenseCreate';
import cleanupAfterSkipConfirmSubmit from '@libs/Navigation/helpers/cleanupAfterSkipConfirmSubmit';
import cleanupAndNavigateAfterExpenseCreate from '@libs/Navigation/helpers/cleanupAndNavigateAfterExpenseCreate';
import type {CleanupAndNavigateAfterExpenseCreateParams} from '@libs/Navigation/helpers/cleanupAndNavigateAfterExpenseCreate';

import CONST from '@src/CONST';
import type {Report, ReportAction} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

jest.mock('@libs/Navigation/helpers/cleanupAfterExpenseCreate', () => jest.fn());
jest.mock('@libs/Navigation/helpers/cleanupAndNavigateAfterExpenseCreate', () => jest.fn());

const chatReport = {reportID: 'chat-1'} as Report;
const linkedTrackedExpenseReportAction = {childReportID: 'child-1'} as OnyxEntry<ReportAction>;

const params: CleanupAndNavigateAfterExpenseCreateParams = {
    action: CONST.IOU.ACTION.CREATE,
    report: chatReport,
    draftTransactionIDs: ['txn-1', 'txn-2'],
    transactionID: 'txn-1',
    isFromGlobalCreate: false,
    backToReport: 'back-to-this-report',
    optimisticChatReportID: 'optimistic-1',
    linkedTrackedExpenseReportAction,
};

describe('cleanupAfterSkipConfirmSubmit', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should delegate to cleanupAndNavigateAfterExpenseCreate with the full params when shouldHandleNavigation is true', () => {
        cleanupAfterSkipConfirmSubmit(true, params);

        expect(cleanupAndNavigateAfterExpenseCreate).toHaveBeenCalledTimes(1);
        expect(cleanupAndNavigateAfterExpenseCreate).toHaveBeenCalledWith(params);
        expect(cleanupAfterExpenseCreate).not.toHaveBeenCalled();
    });

    it('should delegate only the cleanup-relevant subset to cleanupAfterExpenseCreate when shouldHandleNavigation is false', () => {
        cleanupAfterSkipConfirmSubmit(false, params);

        expect(cleanupAfterExpenseCreate).toHaveBeenCalledTimes(1);
        expect(cleanupAfterExpenseCreate).toHaveBeenCalledWith({
            draftTransactionIDs: ['txn-1', 'txn-2'],
            linkedTrackedExpenseReportAction,
        });
        expect(cleanupAndNavigateAfterExpenseCreate).not.toHaveBeenCalled();
    });
});
