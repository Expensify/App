import cleanupAfterExpenseCreate from '@libs/Navigation/helpers/cleanupAfterExpenseCreate';
import cleanupAfterSkipConfirmSubmit from '@libs/Navigation/helpers/cleanupAfterSkipConfirmSubmit';

import type {ReportAction} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

jest.mock('@libs/Navigation/helpers/cleanupAfterExpenseCreate', () => jest.fn());

const linkedTrackedExpenseReportAction = {childReportID: 'child-1'} as OnyxEntry<ReportAction>;

describe('cleanupAfterSkipConfirmSubmit', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should delegate to cleanupAfterExpenseCreate and never navigate (the write action owns navigation)', () => {
        cleanupAfterSkipConfirmSubmit({draftTransactionIDs: ['txn-1', 'txn-2'], linkedTrackedExpenseReportAction});

        expect(cleanupAfterExpenseCreate).toHaveBeenCalledTimes(1);
        expect(cleanupAfterExpenseCreate).toHaveBeenCalledWith({
            draftTransactionIDs: ['txn-1', 'txn-2'],
            linkedTrackedExpenseReportAction,
        });
    });
});
