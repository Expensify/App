import {buildOptimisticUndeletedTransactionAction} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const CURRENT_USER_ACCOUNT_ID = 101;
const CURRENT_USER_EMAIL = 'admin@test.com';
const TRANSACTION_THREAD_REPORT_ID = '555';

describe('buildOptimisticUndeletedTransactionAction', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        Onyx.multiSet({
            [ONYXKEYS.SESSION]: {email: CURRENT_USER_EMAIL, accountID: CURRENT_USER_ACCOUNT_ID},
        });
        return waitForBatchedUpdates();
    });

    it('attributes the action to the current user', () => {
        // Given a signed-in user restoring a trashed card expense
        // When we build the optimistic action
        const action = buildOptimisticUndeletedTransactionAction(TRANSACTION_THREAD_REPORT_ID);

        // Then the action name is UNDELETED_TRANSACTION and the actor is the current user
        expect(action.actionName).toBe(CONST.REPORT.ACTIONS.TYPE.UNDELETED_TRANSACTION);
        expect(action.actorAccountID).toBe(CURRENT_USER_ACCOUNT_ID);
    });

    it('targets the transaction thread with a pending add action', () => {
        // Given a signed-in user restoring a trashed card expense on a transaction thread
        // When we build the optimistic action
        const action = buildOptimisticUndeletedTransactionAction(TRANSACTION_THREAD_REPORT_ID);

        // Then it lives on the transaction thread and is marked pending so a failure can roll it back
        expect(action.reportID).toBe(TRANSACTION_THREAD_REPORT_ID);
        expect(action.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
    });

    it('reads "undeleted this expense" in the message text', () => {
        // Given a signed-in user restoring a trashed card expense
        // When we build the optimistic action
        const action = buildOptimisticUndeletedTransactionAction(TRANSACTION_THREAD_REPORT_ID);

        // Then the inline text matches the server-rendered copy
        const message = Array.isArray(action.message) ? action.message.at(0) : undefined;
        expect(message?.text).toBe('undeleted this expense');
    });
});
