import {renderHook, waitFor} from '@testing-library/react-native';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useShouldSuppressConciergeIndicators from '@hooks/useShouldSuppressConciergeIndicators';

import {useConciergeSessionState} from '@pages/inbox/ConciergeSessionContext';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import createRandomReportAction from '../../utils/collections/reportActions';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

jest.mock('@pages/inbox/ConciergeSessionContext');
jest.mock('@hooks/useCurrentUserPersonalDetails');

const mockUseConciergeSessionState = jest.mocked(useConciergeSessionState);
const mockUseCurrentUserPersonalDetails = jest.mocked(useCurrentUserPersonalDetails);

const REPORT_ID = '1';
const REPORT_ACTION_ID = '100';
const CURRENT_USER_ACCOUNT_ID = 1;
const OTHER_ACCOUNT_ID = 2;
const SESSION_START_TIME = '2026-06-29 10:00:00.000';

function buildAction(overrides: Partial<ReportAction>): ReportAction {
    return {...createRandomReportAction(1), reportActionID: REPORT_ACTION_ID, actorAccountID: CURRENT_USER_ACCOUNT_ID, created: SESSION_START_TIME, pendingAction: undefined, ...overrides};
}

describe('useShouldSuppressConciergeIndicators', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
        // Safe defaults: no active session, so the existing followup-list tests behave as before.
        mockUseConciergeSessionState.mockReturnValue({sessionStartTime: null, showFullHistory: false, hadMessagesAtSessionStart: false});
        mockUseCurrentUserPersonalDetails.mockReturnValue({accountID: CURRENT_USER_ACCOUNT_ID});
    });

    afterEach(async () => {
        await Onyx.clear();
    });

    it('returns false by default (no flag, not in side-panel)', async () => {
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

    describe('session activity (Concierge welcome state)', () => {
        beforeEach(() => {
            // An active session for the main Concierge DM.
            mockUseConciergeSessionState.mockReturnValue({sessionStartTime: SESSION_START_TIME, showFullHistory: false, hadMessagesAtSessionStart: false});
        });

        it('suppresses indicators in a Concierge chat with no session activity', async () => {
            // Given the chat is Concierge but nothing has happened since the session started
            await Onyx.set(ONYXKEYS.CONCIERGE_REPORT_ID, REPORT_ID);
            await waitForBatchedUpdates();

            const {result} = renderHook(() => useShouldSuppressConciergeIndicators(REPORT_ID));

            // Then the welcome state hides the thinking/typing indicators
            await waitFor(() => {
                expect(result.current).toBe(true);
            });
        });

        it('does not suppress once a message exists after the session start', async () => {
            // Given a Concierge reply lands after the session boundary
            await Onyx.set(ONYXKEYS.CONCIERGE_REPORT_ID, REPORT_ID);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`, {
                [REPORT_ACTION_ID]: buildAction({actorAccountID: OTHER_ACCOUNT_ID, created: '2026-06-29 10:05:00.000'}),
            });
            await waitForBatchedUpdates();

            const {result} = renderHook(() => useShouldSuppressConciergeIndicators(REPORT_ID));

            // Then indicators are free to display
            await waitFor(() => {
                expect(result.current).toBe(false);
            });
        });

        it("keeps indicators visible for the current user's optimistic message whose created is skewed before the session start", async () => {
            // Given a still-optimistic (pendingAction === ADD) message skewed before the session start.
            await Onyx.set(ONYXKEYS.CONCIERGE_REPORT_ID, REPORT_ID);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`, {
                [REPORT_ACTION_ID]: buildAction({
                    actorAccountID: CURRENT_USER_ACCOUNT_ID,
                    created: '2026-06-29 09:59:00.000',
                    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                }),
            });
            await waitForBatchedUpdates();

            const {result} = renderHook(() => useShouldSuppressConciergeIndicators(REPORT_ID));

            // Then the message counts as session activity, so the indicators are not suppressed
            await waitFor(() => {
                expect(result.current).toBe(false);
            });
        });
    });
});
