import {act, renderHook, waitFor} from '@testing-library/react-native';

import useShouldShowEmptyReportConfirmation from '@hooks/useShouldShowEmptyReportConfirmation';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

const POLICY_ID = 'workspace-001';
const ACCOUNT_ID = 987654;

function buildReport(reportID: string, overrides: Partial<Report> = {}): Report {
    return {
        reportID,
        policyID: POLICY_ID,
        ownerAccountID: ACCOUNT_ID,
        type: CONST.REPORT.TYPE.EXPENSE,
        stateNum: CONST.REPORT.STATE_NUM.OPEN,
        statusNum: CONST.REPORT.STATUS_NUM.OPEN,
        total: 0,
        nonReimbursableTotal: 0,
        pendingAction: null,
        errors: undefined,
        ...overrides,
    };
}

describe('useShouldShowEmptyReportConfirmation', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    afterEach(async () => {
        await Onyx.clear();
    });

    it('returns false when policyID is undefined', async () => {
        await Onyx.merge(ONYXKEYS.SESSION, {accountID: ACCOUNT_ID});
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}report-1`, buildReport('report-1'));

        const {result} = renderHook(() => useShouldShowEmptyReportConfirmation(undefined));

        await waitFor(() => {
            expect(result.current).toBe(false);
        });
    });

    it('returns false when there are no reports', async () => {
        await Onyx.merge(ONYXKEYS.SESSION, {accountID: ACCOUNT_ID});

        const {result} = renderHook(() => useShouldShowEmptyReportConfirmation(POLICY_ID));

        await waitFor(() => {
            expect(result.current).toBe(false);
        });
    });

    it('returns true when an owned open expense report has no transactions', async () => {
        await Onyx.merge(ONYXKEYS.SESSION, {accountID: ACCOUNT_ID});
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}empty-report`, buildReport('empty-report'));

        const {result} = renderHook(() => useShouldShowEmptyReportConfirmation(POLICY_ID));

        await waitFor(() => {
            expect(result.current).toBe(true);
        });
    });

    it('returns false when reports belong to a different policy', async () => {
        await Onyx.merge(ONYXKEYS.SESSION, {accountID: ACCOUNT_ID});
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}report-1`, buildReport('report-1', {policyID: 'other-policy'}));

        const {result} = renderHook(() => useShouldShowEmptyReportConfirmation(POLICY_ID));

        await waitFor(() => {
            expect(result.current).toBe(false);
        });
    });

    it('returns false when reports belong to a different owner', async () => {
        await Onyx.merge(ONYXKEYS.SESSION, {accountID: ACCOUNT_ID});
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}report-1`, buildReport('report-1', {ownerAccountID: 111111}));

        const {result} = renderHook(() => useShouldShowEmptyReportConfirmation(POLICY_ID));

        await waitFor(() => {
            expect(result.current).toBe(false);
        });
    });

    it('returns false when confirmation has been dismissed', async () => {
        await Onyx.merge(ONYXKEYS.SESSION, {accountID: ACCOUNT_ID});
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}empty-report`, buildReport('empty-report'));
        await Onyx.merge(ONYXKEYS.NVP_EMPTY_REPORTS_CONFIRMATION_DISMISSED, true);

        const {result} = renderHook(() => useShouldShowEmptyReportConfirmation(POLICY_ID));

        await waitFor(() => {
            expect(result.current).toBe(false);
        });
    });

    it('updates when report data changes in Onyx', async () => {
        await Onyx.merge(ONYXKEYS.SESSION, {accountID: ACCOUNT_ID});

        const {result} = renderHook(() => useShouldShowEmptyReportConfirmation(POLICY_ID));
        await waitForBatchedUpdatesWithAct();

        expect(result.current).toBe(false);

        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}new-report`, buildReport('new-report'));
        });
        await waitForBatchedUpdatesWithAct();

        expect(result.current).toBe(true);
    });
});
