import {renderHook, waitFor} from '@testing-library/react-native';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useIsInSidePanel from '@hooks/useIsInSidePanel';
import useShouldSuppressConciergeIndicators from '@hooks/useShouldSuppressConciergeIndicators';
import useSidePanelState from '@hooks/useSidePanelState';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction} from '@src/types/onyx';

// eslint-disable-next-line no-restricted-imports -- useSidePanelState types its refs as React Native Animated.Value, so the mock needs the same class.
import {Animated} from 'react-native';
import Onyx from 'react-native-onyx';

import createRandomReportAction from '../../utils/collections/reportActions';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

jest.mock('@hooks/useCurrentUserPersonalDetails');
jest.mock('@hooks/useIsInSidePanel');
jest.mock('@hooks/useSidePanelState');

const mockUseIsInSidePanel = jest.mocked(useIsInSidePanel);
const mockUseSidePanelState = jest.mocked(useSidePanelState);
const mockUseCurrentUserPersonalDetails = jest.mocked(useCurrentUserPersonalDetails);

const REPORT_ID = '1';
const REPORT_ACTION_ID = '100';
const CURRENT_USER_ACCOUNT_ID = 1;
const OTHER_ACCOUNT_ID = 2;
const SESSION_START_TIME = '2026-06-29 10:00:00.000';

const sidePanelState: ReturnType<typeof useSidePanelState> = {
    sessionStartTime: null,
    isSidePanelTransitionEnded: true,
    isSidePanelHiddenOrLargeScreen: true,
    shouldHideSidePanel: true,
    shouldHideSidePanelBackdrop: true,
    shouldHideHelpButton: false,
    shouldHideToolTip: false,
    sidePanelOffset: {current: new Animated.Value(0)},
    sidePanelTranslateX: {current: new Animated.Value(0)},
};

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
        // Safe defaults: outside the side panel with no active session, so the followup-list tests only exercise the flag.
        mockUseIsInSidePanel.mockReturnValue(false);
        mockUseSidePanelState.mockReturnValue(sidePanelState);
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

    it('suppresses indicators in the main Concierge chat even with messages in it', async () => {
        // Given the main Concierge chat with a Concierge reply in it
        await Onyx.set(ONYXKEYS.CONCIERGE_REPORT_ID, REPORT_ID);
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`, {
            [REPORT_ACTION_ID]: buildAction({actorAccountID: OTHER_ACCOUNT_ID, created: '2026-06-29 10:05:00.000'}),
        });
        await waitForBatchedUpdates();

        // When the hook evaluates suppression outside the side panel
        const {result} = renderHook(() => useShouldSuppressConciergeIndicators(REPORT_ID));

        // Then the indicators stay hidden, because Concierge answers each question in its own thread
        await waitFor(() => {
            expect(result.current).toBe(true);
        });
    });

    describe('side panel session activity (Concierge welcome state)', () => {
        beforeEach(() => {
            // An active side panel session.
            mockUseIsInSidePanel.mockReturnValue(true);
            mockUseSidePanelState.mockReturnValue({...sidePanelState, sessionStartTime: SESSION_START_TIME});
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
