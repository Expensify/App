import {act, renderHook} from '@testing-library/react-native';

import useAutoCategorizationExpiry from '@hooks/useAutoCategorizationExpiry';
import initOnyxDerivedValues from '@userActions/OnyxDerived';
import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report, Transaction} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import getOnyxValue from '../utils/getOnyxValue';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const ONE_MINUTE_MS = 60 * 1000;
const transactionKey = `${ONYXKEYS.COLLECTION.TRANSACTION}1` as const;

function getPendingTime(offsetMs = 0) {
    return new Date(Date.now() + offsetMs).toISOString().replace('T', ' ').replace('Z', '');
}

function buildTransaction(transactionID = '1', offsetMs = 0): Transaction {
    return {
        transactionID,
        reportID: '20',
        amount: 5000,
        currency: CONST.CURRENCY.USD,
        created: '2026-11-07',
        merchant: 'Test merchant',
        category: '',
        comment: {comment: 'Keep this description', pendingAutoCategorizationTime: getPendingTime(offsetMs)},
    };
}

describe('useAutoCategorizationExpiry', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        initOnyxDerivedValues();
    });

    beforeEach(async () => {
        await Onyx.clear();
        await IntlStore.load(CONST.LOCALES.EN);
        await waitForBatchedUpdates();
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it("updates the chat's derived brick road status when the 60-second grace period expires", async () => {
        // Given an instant-submit expense awaiting approval, with a missing category hidden during auto-categorization
        const policy: Policy = {
            id: '10',
            name: 'Test workspace',
            type: CONST.POLICY.TYPE.TEAM,
            role: CONST.POLICY.ROLE.ADMIN,
            owner: 'test@example.com',
            outputCurrency: CONST.CURRENCY.USD,
            approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
            reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES,
            autoCategorizeNewExpenses: true,
            autoReporting: true,
            autoReportingFrequency: CONST.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT,
            requiresCategory: true,
            areCategoriesEnabled: true,
        };
        const chat: Report = {
            reportID: '30',
            type: CONST.REPORT.TYPE.CHAT,
            chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
            policyID: policy.id,
            ownerAccountID: 1,
            isOwnPolicyExpenseChat: true,
            iouReportID: '20',
            hasOutstandingChildRequest: true,
        };
        const expenseReport: Report = {
            reportID: '20',
            chatReportID: chat.reportID,
            policyID: policy.id,
            ownerAccountID: 1,
            managerID: 2,
            type: CONST.REPORT.TYPE.EXPENSE,
            currency: CONST.CURRENCY.USD,
            total: 5000,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
        };
        await Promise.all([
            Onyx.set(ONYXKEYS.SESSION, {accountID: 1, email: 'test@example.com'}),
            Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.EN),
            Onyx.set(ONYXKEYS.RAM_ONLY_ARE_TRANSLATIONS_LOADING, false),
            Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy),
            Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${chat.reportID}`, chat),
            Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`, expenseReport),
            Onyx.set(transactionKey, buildTransaction()),
            Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}1`, [{name: CONST.VIOLATIONS.MISSING_CATEGORY, type: CONST.VIOLATION_TYPES.VIOLATION, showInReview: true}]),
        ]);
        await act(async () => jest.advanceTimersByTimeAsync(0));
        const {unmount} = renderHook(() => useAutoCategorizationExpiry());
        await act(async () => jest.advanceTimersByTimeAsync(0));
        expect((await Onyx.get(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES))?.reports[chat.reportID]?.brickRoadStatus).not.toBe(CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR);

        // When only time passes, with no unrelated Onyx write or navigation
        await act(async () => jest.advanceTimersByTimeAsync(ONE_MINUTE_MS + 1));

        // Then the transaction write refreshes the parent chat's actual derived status and preserves other comment fields
        expect((await Onyx.get(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES))?.reports[chat.reportID]?.brickRoadStatus).toBe(CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR);
        expect((await getOnyxValue(transactionKey))?.comment).toEqual({comment: 'Keep this description'});
        unmount();
    });

    it('expires transactions in deadline order and continues to the next one', async () => {
        // Given transactions inserted in the opposite order to their deadlines
        const laterKey = `${ONYXKEYS.COLLECTION.TRANSACTION}2` as const;
        await Onyx.multiSet({[laterKey]: buildTransaction('2', ONE_MINUTE_MS), [transactionKey]: buildTransaction()});
        const {unmount} = renderHook(() => useAutoCategorizationExpiry());
        await act(async () => jest.advanceTimersByTimeAsync(0));

        // When the first deadline passes
        await act(async () => jest.advanceTimersByTimeAsync(ONE_MINUTE_MS));

        // Then only the earlier marker is cleared
        expect((await getOnyxValue(transactionKey))?.comment?.pendingAutoCategorizationTime).toBeUndefined();
        expect((await getOnyxValue(laterKey))?.comment?.pendingAutoCategorizationTime).toBeDefined();

        // When the second deadline passes
        await act(async () => jest.advanceTimersByTimeAsync(ONE_MINUTE_MS));

        // Then the single scheduler has moved on to that transaction
        expect((await getOnyxValue(laterKey))?.comment?.pendingAutoCategorizationTime).toBeUndefined();
        unmount();
    });

    it('cancels the old deadline when the timestamp changes and cleans up on unmount', async () => {
        // Given an active deadline
        await Onyx.set(transactionKey, buildTransaction());
        const {unmount} = renderHook(() => useAutoCategorizationExpiry());
        await act(async () => jest.advanceTimersByTimeAsync(0));

        // When the server extends the timestamp
        const updatedTime = getPendingTime(ONE_MINUTE_MS);
        await act(async () => {
            await Onyx.merge(transactionKey, {comment: {pendingAutoCategorizationTime: updatedTime}});
            await jest.advanceTimersByTimeAsync(0);
        });
        await act(async () => jest.advanceTimersByTimeAsync(ONE_MINUTE_MS));

        // Then the old timer cannot clear the new marker
        expect((await getOnyxValue(transactionKey))?.comment?.pendingAutoCategorizationTime).toBe(updatedTime);

        // When the scheduler unmounts before the new deadline
        unmount();
        await act(async () => jest.advanceTimersByTimeAsync(ONE_MINUTE_MS));

        // Then its timer has been cancelled
        expect((await getOnyxValue(transactionKey))?.comment?.pendingAutoCategorizationTime).toBe(updatedTime);
    });

    it('splits deadlines beyond LIMIT_TIMEOUT without expiring them early', async () => {
        // Given a future timestamp far enough away to overflow a single setTimeout
        await Onyx.set(transactionKey, buildTransaction('1', CONST.LIMIT_TIMEOUT));
        const {unmount} = renderHook(() => useAutoCategorizationExpiry());
        await act(async () => jest.advanceTimersByTimeAsync(0));

        // When the first maximum-length wait finishes
        await act(async () => jest.advanceTimersByTimeAsync(CONST.LIMIT_TIMEOUT));

        // Then the marker remains until the remaining grace period finishes
        expect((await getOnyxValue(transactionKey))?.comment?.pendingAutoCategorizationTime).toBeDefined();
        await act(async () => jest.advanceTimersByTimeAsync(ONE_MINUTE_MS));
        expect((await getOnyxValue(transactionKey))?.comment?.pendingAutoCategorizationTime).toBeUndefined();
        unmount();
    });
});
