import {renderHook, waitFor} from '@testing-library/react-native';

import useShouldSuppressConciergeIndicators from '@hooks/useShouldSuppressConciergeIndicators';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import createRandomReportAction from '../../utils/collections/reportActions';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

const REPORT_ID = '1';
const REPORT_ACTION_ID = '100';
const OTHER_ACCOUNT_ID = 2;

function buildAction(overrides: Partial<ReportAction>): ReportAction {
    return {
        ...createRandomReportAction(1),
        actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
        reportActionID: REPORT_ACTION_ID,
        pendingAction: undefined,
        ...overrides,
    };
}

describe('useShouldSuppressConciergeIndicators', () => {
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

    it('returns false by default (no flag, not the Concierge chat)', async () => {
        const {result} = renderHook(() => useShouldSuppressConciergeIndicators(REPORT_ID));

        await waitFor(() => {
            expect(result.current).toBe(false);
        });
    });

    it('returns true while a followup-list pending flag is set for this report', async () => {
        // Given the skeleton flag is active for this report
        await Onyx.set(`${ONYXKEYS.COLLECTION.CONCIERGE_PENDING_FOLLOWUP_LIST}${REPORT_ID}`, {
            reportActionID: REPORT_ACTION_ID,
            createdAt: Date.now(),
        });
        await waitForBatchedUpdates();

        // When the hook evaluates suppression for the same report
        const {result} = renderHook(() => useShouldSuppressConciergeIndicators(REPORT_ID));

        // Then both the thinking bubble and typing-dots indicator must be hidden so the
        // per-action skeleton is the only loading affordance.
        await waitFor(() => {
            expect(result.current).toBe(true);
        });
    });

    it('does not suppress indicators for an unrelated report', async () => {
        // Given the flag is set for a different report
        await Onyx.set(`${ONYXKEYS.COLLECTION.CONCIERGE_PENDING_FOLLOWUP_LIST}2`, {
            reportActionID: REPORT_ACTION_ID,
            createdAt: Date.now(),
        });
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useShouldSuppressConciergeIndicators(REPORT_ID));

        await waitFor(() => {
            expect(result.current).toBe(false);
        });
    });

    it('un-suppresses once the followup-list flag is cleared', async () => {
        // Given the flag is initially set
        await Onyx.set(`${ONYXKEYS.COLLECTION.CONCIERGE_PENDING_FOLLOWUP_LIST}${REPORT_ID}`, {
            reportActionID: REPORT_ACTION_ID,
            createdAt: Date.now(),
        });
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useShouldSuppressConciergeIndicators(REPORT_ID));
        await waitFor(() => {
            expect(result.current).toBe(true);
        });

        // When the canonical reply arrives and the reconciliation effect clears the flag
        await Onyx.set(`${ONYXKEYS.COLLECTION.CONCIERGE_PENDING_FOLLOWUP_LIST}${REPORT_ID}`, null);
        await waitForBatchedUpdates();

        // Then suppression flips back to false on the next render — server-driven
        // "Concierge is working…" indicators are once again free to display.
        await waitFor(() => {
            expect(result.current).toBe(false);
        });
    });

    it('suppresses indicators in the Concierge chat even with messages in it', async () => {
        // Given the Concierge chat with a Concierge reply in it
        await Onyx.set(ONYXKEYS.CONCIERGE_REPORT_ID, REPORT_ID);
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`, {
            [REPORT_ACTION_ID]: buildAction({actorAccountID: OTHER_ACCOUNT_ID, created: '2026-06-29 10:05:00.000'}),
        });
        await waitForBatchedUpdates();

        // When the hook evaluates suppression
        const {result} = renderHook(() => useShouldSuppressConciergeIndicators(REPORT_ID));

        // Then the indicators stay hidden, because Concierge answers each question in its own thread
        await waitFor(() => {
            expect(result.current).toBe(true);
        });
    });
});
