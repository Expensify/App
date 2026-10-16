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
    return {
        ...createRandomReportAction(1),
        // createRandomReportAction picks a random actionName; CREATED actions are excluded from session activity, so pin a regular comment.
        actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
        reportActionID: REPORT_ACTION_ID,
        actorAccountID: CURRENT_USER_ACCOUNT_ID,
        created: SESSION_START_TIME,
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

    describe('newer user turn during the followup-list window', () => {
        const QUESTION_ID = '90';
        const NEWER_MESSAGE_ID = '95';
        const REPLY_ID = REPORT_ACTION_ID;
        const LATER_CONCIERGE_ID = '101';
        const CONCIERGE_ACCOUNT_ID = CONST.ACCOUNT_ID.CONCIERGE;

        async function seedFollowupTurn(actions: Record<string, ReportAction>, questionReportActionID?: string) {
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`, actions);
            await Onyx.set(`${ONYXKEYS.COLLECTION.CONCIERGE_PENDING_FOLLOWUP_LIST}${REPORT_ID}`, {
                reportActionID: REPLY_ID,
                createdAt: Date.now(),
                questionReportActionID,
            });
            await waitForBatchedUpdates();
        }

        it('stops suppressing once the user sends a message after the question, even though the reply is future-stamped newest', async () => {
            // Given a followup turn whose pregenerated reply is stamped 4s after the question, and a
            // second user message sent inside that window (so it sorts before the reply)
            await seedFollowupTurn(
                {
                    [QUESTION_ID]: buildAction({reportActionID: QUESTION_ID, created: '2026-06-29 10:00:00.000'}),
                    [NEWER_MESSAGE_ID]: buildAction({reportActionID: NEWER_MESSAGE_ID, created: '2026-06-29 10:00:02.000'}),
                    [REPLY_ID]: buildAction({reportActionID: REPLY_ID, actorAccountID: CONCIERGE_ACCOUNT_ID, created: '2026-06-29 10:00:04.000'}),
                },
                QUESTION_ID,
            );

            const {result} = renderHook(() => useShouldSuppressConciergeIndicators(REPORT_ID));

            // Then the skeleton window no longer hides the indicators — that message is a turn of its own
            await waitFor(() => {
                expect(result.current).toBe(false);
            });
        });

        it('keeps suppressing while only the question exists', async () => {
            await seedFollowupTurn(
                {
                    [QUESTION_ID]: buildAction({reportActionID: QUESTION_ID, created: '2026-06-29 10:00:00.000'}),
                    [REPLY_ID]: buildAction({reportActionID: REPLY_ID, actorAccountID: CONCIERGE_ACCOUNT_ID, created: '2026-06-29 10:00:04.000'}),
                },
                QUESTION_ID,
            );

            const {result} = renderHook(() => useShouldSuppressConciergeIndicators(REPORT_ID));

            await waitFor(() => {
                expect(result.current).toBe(true);
            });
        });

        it('keeps suppressing when the only newer action is from Concierge', async () => {
            await seedFollowupTurn(
                {
                    [QUESTION_ID]: buildAction({reportActionID: QUESTION_ID, created: '2026-06-29 10:00:00.000'}),
                    [REPLY_ID]: buildAction({reportActionID: REPLY_ID, actorAccountID: CONCIERGE_ACCOUNT_ID, created: '2026-06-29 10:00:04.000'}),
                    [LATER_CONCIERGE_ID]: buildAction({reportActionID: LATER_CONCIERGE_ID, actorAccountID: CONCIERGE_ACCOUNT_ID, created: '2026-06-29 10:00:05.000'}),
                },
                QUESTION_ID,
            );

            const {result} = renderHook(() => useShouldSuppressConciergeIndicators(REPORT_ID));

            await waitFor(() => {
                expect(result.current).toBe(true);
            });
        });

        it('keeps suppressing when the pending flag predates questionReportActionID', async () => {
            // Given a flag persisted by an older client, with no question anchor to compare against
            await seedFollowupTurn({
                [QUESTION_ID]: buildAction({reportActionID: QUESTION_ID, created: '2026-06-29 10:00:00.000'}),
                [NEWER_MESSAGE_ID]: buildAction({reportActionID: NEWER_MESSAGE_ID, created: '2026-06-29 10:00:02.000'}),
                [REPLY_ID]: buildAction({reportActionID: REPLY_ID, actorAccountID: CONCIERGE_ACCOUNT_ID, created: '2026-06-29 10:00:04.000'}),
            });

            const {result} = renderHook(() => useShouldSuppressConciergeIndicators(REPORT_ID));

            // Then behavior falls back to the pre-anchor suppression instead of guessing
            await waitFor(() => {
                expect(result.current).toBe(true);
            });
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
