import {renderHook} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import usePolicyHasEmptyReport from '@hooks/usePolicyHasEmptyReport';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

describe('usePolicyHasEmptyReport', () => {
    const POLICY_ID = 'test-policy-123';
    const OTHER_POLICY_ID = 'other-policy-456';
    const ACCOUNT_ID = 1234;
    const OTHER_ACCOUNT_ID = 5678;

    beforeAll(() =>
        Onyx.init({
            keys: ONYXKEYS,
        }),
    );

    beforeEach(() =>
        Onyx.clear().then(() =>
            Onyx.multiSet({
                [ONYXKEYS.SESSION]: {accountID: ACCOUNT_ID},
            }),
        ),
    );

    afterEach(() => Onyx.clear());

    it('should return false when there are no reports', async () => {
        const {result} = renderHook(() => usePolicyHasEmptyReport(POLICY_ID));

        await waitForBatchedUpdates();

        expect(result.current).toBe(false);
    });

    it('should return false when policyID is undefined', async () => {
        const {result} = renderHook(() => usePolicyHasEmptyReport(undefined));

        await waitForBatchedUpdates();

        expect(result.current).toBe(false);
    });

    it('should return true when there is an empty report owned by the user for the specified policy', async () => {
        const emptyReport: Report = {
            reportID: 'report-1',
            policyID: POLICY_ID,
            ownerAccountID: ACCOUNT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            lastVisibleActionCreated: '',
            lastMessageText: '', // Empty report has no messages
        };

        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}report-1`, emptyReport);
        await waitForBatchedUpdates();

        const {result} = renderHook(() => usePolicyHasEmptyReport(POLICY_ID));

        await waitForBatchedUpdates();

        expect(result.current).toBe(true);
    });

    it('should return false when the report has messages (not empty)', async () => {
        const reportWithMessages: Report = {
            reportID: 'report-2',
            policyID: POLICY_ID,
            ownerAccountID: ACCOUNT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            lastVisibleActionCreated: '',
            lastMessageText: 'This report has messages',
        };

        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}report-2`, reportWithMessages);
        await waitForBatchedUpdates();

        const {result} = renderHook(() => usePolicyHasEmptyReport(POLICY_ID));

        await waitForBatchedUpdates();

        expect(result.current).toBe(false);
    });

    it('should return false when the empty report belongs to a different policy', async () => {
        const emptyReportDifferentPolicy: Report = {
            reportID: 'report-3',
            policyID: OTHER_POLICY_ID,
            ownerAccountID: ACCOUNT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            lastVisibleActionCreated: '',
            lastMessageText: '',
        };

        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}report-3`, emptyReportDifferentPolicy);
        await waitForBatchedUpdates();

        const {result} = renderHook(() => usePolicyHasEmptyReport(POLICY_ID));

        await waitForBatchedUpdates();

        expect(result.current).toBe(false);
    });

    it('should return false when the empty report is owned by a different user', async () => {
        const emptyReportDifferentOwner: Report = {
            reportID: 'report-4',
            policyID: POLICY_ID,
            ownerAccountID: OTHER_ACCOUNT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            lastVisibleActionCreated: '',
            lastMessageText: '',
        };

        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}report-4`, emptyReportDifferentOwner);
        await waitForBatchedUpdates();

        const {result} = renderHook(() => usePolicyHasEmptyReport(POLICY_ID));

        await waitForBatchedUpdates();

        expect(result.current).toBe(false);
    });

    it('should return false when the report is not an expense report', async () => {
        const emptyNonExpenseReport: Report = {
            reportID: 'report-5',
            policyID: POLICY_ID,
            ownerAccountID: ACCOUNT_ID,
            type: CONST.REPORT.TYPE.CHAT,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            lastVisibleActionCreated: '',
            lastMessageText: '',
        };

        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}report-5`, emptyNonExpenseReport);
        await waitForBatchedUpdates();

        const {result} = renderHook(() => usePolicyHasEmptyReport(POLICY_ID));

        await waitForBatchedUpdates();

        expect(result.current).toBe(false);
    });

    it('should return false when the report is closed', async () => {
        const closedEmptyReport: Report = {
            reportID: 'report-6',
            policyID: POLICY_ID,
            ownerAccountID: ACCOUNT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            stateNum: CONST.REPORT.STATE_NUM.APPROVED,
            statusNum: CONST.REPORT.STATUS_NUM.CLOSED,
            lastVisibleActionCreated: '',
            lastMessageText: '',
        };

        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}report-6`, closedEmptyReport);
        await waitForBatchedUpdates();

        const {result} = renderHook(() => usePolicyHasEmptyReport(POLICY_ID));

        await waitForBatchedUpdates();

        expect(result.current).toBe(false);
    });

    it('should return true when there are multiple reports and at least one is an owned empty report', async () => {
        const emptyReport: Report = {
            reportID: 'report-7',
            policyID: POLICY_ID,
            ownerAccountID: ACCOUNT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            lastVisibleActionCreated: '',
            lastMessageText: '',
        };

        const reportWithMessages: Report = {
            reportID: 'report-8',
            policyID: POLICY_ID,
            ownerAccountID: ACCOUNT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            lastVisibleActionCreated: '',
            lastMessageText: 'This report has messages',
        };

        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}report-7`, emptyReport);
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}report-8`, reportWithMessages);
        await waitForBatchedUpdates();

        const {result} = renderHook(() => usePolicyHasEmptyReport(POLICY_ID));

        await waitForBatchedUpdates();

        expect(result.current).toBe(true);
    });

    it('should update when reports change', async () => {
        const {result} = renderHook(() => usePolicyHasEmptyReport(POLICY_ID));

        await waitForBatchedUpdates();

        // Initially no empty reports
        expect(result.current).toBe(false);

        // Add an empty report
        const emptyReport: Report = {
            reportID: 'report-9',
            policyID: POLICY_ID,
            ownerAccountID: ACCOUNT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            lastVisibleActionCreated: '',
            lastMessageText: '',
        };

        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}report-9`, emptyReport);
        await waitForBatchedUpdates();

        // Now should detect the empty report (hook automatically updates when Onyx changes)
        expect(result.current).toBe(true);
    });

    it('should handle missing session gracefully', async () => {
        await Onyx.set(ONYXKEYS.SESSION, null);
        await waitForBatchedUpdates();

        const {result} = renderHook(() => usePolicyHasEmptyReport(POLICY_ID));

        await waitForBatchedUpdates();

        expect(result.current).toBe(false);
    });
});
