import {renderHook} from '@testing-library/react-native';

import useConciergeSidePanelReportActions from '@hooks/useConciergeSidePanelReportActions';

import {getDBTimeWithSkew, getServerAnchoredDBTime} from '@libs/NetworkState';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import createRandomReportAction from '../../utils/collections/reportActions';
import {createRandomReport} from '../../utils/collections/reports';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

const REPORT_ID = '1';
const CURRENT_USER_ACCOUNT_ID = 1;
const CONCIERGE_ACCOUNT_ID = 2;

// The client clock reads 5s ahead of the server (negative skew) — the condition that used to hide the reply.
const SKEW_MS = -5000;
// A fixed client-clock reading for when the side panel opens, so the assertions don't depend on the wall clock.
const CLIENT_OPEN_MS = Date.UTC(2026, 5, 29, 10, 0, 0);

/** Formats an epoch-ms value as a server DB-time string, matching how the backend stamps replies. */
function toDBTime(ms: number): string {
    return new Date(ms).toISOString().replace('T', ' ').replace('Z', '');
}

function buildAction(reportActionID: string, overrides: Partial<ReportAction>): ReportAction {
    return {
        ...createRandomReportAction(Number(reportActionID)),
        reportActionID,
        actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
        actorAccountID: CURRENT_USER_ACCOUNT_ID,
        pendingAction: undefined,
        ...overrides,
    };
}

function renderSidePanel(sessionStartTime: string, question: ReportAction, reply: ReportAction) {
    // Pre-session history (loaded) so the panel is in "existing account / hidden history" mode.
    const createdAction = buildAction('10', {actionName: CONST.REPORT.ACTIONS.TYPE.CREATED, created: toDBTime(CLIENT_OPEN_MS - 7_200_000)});
    const preSessionUser = buildAction('11', {created: toDBTime(CLIENT_OPEN_MS - 3_600_000)});
    const preSessionConcierge = buildAction('12', {actorAccountID: CONCIERGE_ACCOUNT_ID, created: toDBTime(CLIENT_OPEN_MS - 3_500_000)});
    const reportActions = [createdAction, preSessionUser, preSessionConcierge, question, reply];

    const report: Report = {...createRandomReport(Number(REPORT_ID)), reportID: REPORT_ID, lastReadTime: sessionStartTime};

    return renderHook(() =>
        useConciergeSidePanelReportActions({
            report,
            reportActions,
            visibleReportActions: reportActions,
            isConciergeHiddenHistory: true,
            hasUserSentMessage: true,
            hasOlderActions: false,
            sessionStartTime,
            currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
            greetingText: 'Hi there, how can I help?',
            loadOlderChats: jest.fn(),
        }),
    );
}

describe('useConciergeSidePanelReportActions (clock-skew reply visibility)', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        // Reproduce a client clock running 5s ahead of the server.
        await Onyx.merge(ONYXKEYS.NETWORK, {timeSkew: SKEW_MS});
        await waitForBatchedUpdates();
    });

    it("keeps Concierge's reply visible when the boundary and question are anchored to the server clock (the fix)", () => {
        // Given the boundary and question are server-anchored, and the reply carries a server timestamp.
        const sessionStartTime = getServerAnchoredDBTime(CLIENT_OPEN_MS);
        const question = buildAction('20', {created: getServerAnchoredDBTime(CLIENT_OPEN_MS + 2000)});
        const reply = buildAction('21', {actorAccountID: CONCIERGE_ACCOUNT_ID, created: toDBTime(CLIENT_OPEN_MS - 5000 + 4000)});

        // When the side panel filters the session's actions
        const {result} = renderSidePanel(sessionStartTime, question, reply);
        const visibleIDs = result.current.filteredReportActions.map((action) => action.reportActionID);

        // Then the question and the reply both stay visible, while prior history stays hidden.
        expect(visibleIDs).toContain('20');
        expect(visibleIDs).toContain('21');
        expect(visibleIDs).not.toContain('11');
        expect(visibleIDs).not.toContain('12');
    });

    it("keeps Concierge's reply visible when the question's `created` was clamped forward onto an ahead client clock", () => {
        // Given the boundary is server-anchored, but the question's `created` was clamped forward past a prior
        // action that sat on the ahead client clock (the monotonic clamp), landing it in the future.
        const sessionStartTime = getServerAnchoredDBTime(CLIENT_OPEN_MS);
        const question = buildAction('20', {created: toDBTime(CLIENT_OPEN_MS + 1)});
        // The reply carries a real server timestamp that lands after the boundary but below the clamped question.
        const reply = buildAction('21', {actorAccountID: CONCIERGE_ACCOUNT_ID, created: toDBTime(CLIENT_OPEN_MS - 1000)});

        // When the side panel filters the session's actions
        const {result} = renderSidePanel(sessionStartTime, question, reply);
        const visibleIDs = result.current.filteredReportActions.map((action) => action.reportActionID);

        // Then the reply stays visible because it is bounded by the server-anchored sessionStartTime, not the
        // clamped question timestamp; prior history stays hidden.
        expect(visibleIDs).toContain('20');
        expect(visibleIDs).toContain('21');
        expect(visibleIDs).not.toContain('11');
        expect(visibleIDs).not.toContain('12');
    });

    it('drops the reply when the boundary and question stay on the ahead client clock (pre-fix regression guard)', () => {
        // Given the boundary and question stay on the raw client clock (what getDBTimeWithSkew returns under negative skew).
        const sessionStartTime = getDBTimeWithSkew(CLIENT_OPEN_MS);
        const question = buildAction('20', {created: getDBTimeWithSkew(CLIENT_OPEN_MS + 2000)});
        const reply = buildAction('21', {actorAccountID: CONCIERGE_ACCOUNT_ID, created: toDBTime(CLIENT_OPEN_MS - 5000 + 4000)});

        // When the side panel filters the session's actions
        const {result} = renderSidePanel(sessionStartTime, question, reply);
        const visibleIDs = result.current.filteredReportActions.map((action) => action.reportActionID);

        // Then the reply falls below the ahead-client boundary and disappears — the failure this PR fixes.
        expect(visibleIDs).toContain('20');
        expect(visibleIDs).not.toContain('21');
    });
});

describe('useConciergeSidePanelReportActions (sent-message retention)', () => {
    const SESSION_START = toDBTime(CLIENT_OPEN_MS);

    const createdAction = buildAction('10', {actionName: CONST.REPORT.ACTIONS.TYPE.CREATED, created: toDBTime(CLIENT_OPEN_MS - 7_200_000)});
    const preSessionUser = buildAction('11', {created: toDBTime(CLIENT_OPEN_MS - 3_600_000)});
    const preSessionConcierge = buildAction('12', {actorAccountID: CONCIERGE_ACCOUNT_ID, created: toDBTime(CLIENT_OPEN_MS - 3_500_000)});

    /** Mirrors how `useReportActionsVisibility` calls the hook: the side panel drives its own local state. */
    function buildProps(sentMessage: ReportAction, hasUserSentMessage: boolean) {
        const reportActions = [createdAction, preSessionUser, preSessionConcierge, sentMessage];
        const report: Report = {...createRandomReport(Number(REPORT_ID)), reportID: REPORT_ID, lastReadTime: SESSION_START};

        return {
            report,
            reportActions,
            visibleReportActions: reportActions,
            isConciergeHiddenHistory: true,
            hasUserSentMessage,
            hasOlderActions: false,
            sessionStartTime: SESSION_START,
            currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
            greetingText: 'Hi there, how can I help?',
            loadOlderChats: jest.fn(),
        };
    }

    /** The message as it is sent (pending), then as the server hands it back stamped below the boundary. */
    const pendingMessage = () => buildAction('20', {created: toDBTime(CLIENT_OPEN_MS + 500), pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD});
    const restampedMessage = () => buildAction('20', {created: toDBTime(CLIENT_OPEN_MS - 3000), pendingAction: undefined});

    function renderSurface() {
        const {result, rerender} = renderHook((props: Parameters<typeof useConciergeSidePanelReportActions>[0]) => useConciergeSidePanelReportActions(props), {
            initialProps: buildProps(pendingMessage(), true),
        });
        return {
            result,
            // The server response clears the pending flag and re-stamps `created`, which also flips `hasUserSentMessage`.
            landServerResponse: () => rerender(buildProps(restampedMessage(), false)),
        };
    }

    it('keeps the message the user just sent when the server stamps it below the session boundary', () => {
        // Given the user's message is still pending, so it is visible on the strength of its pending state
        const {result, landServerResponse} = renderSurface();
        expect(result.current.filteredReportActions.map((action) => action.reportActionID)).toContain('20');

        // When the server response lands and re-stamps `created` behind the boundary
        landServerResponse();

        // Then the message stays on screen and the welcome state does not come back over the conversation.
        expect(result.current.filteredReportActions.map((action) => action.reportActionID)).toContain('20');
        expect(result.current.showConciergeSidePanelWelcome).toBe(false);
        // ...and the read history is still collapsed behind "Show history".
        expect(result.current.filteredReportActions.map((action) => action.reportActionID)).not.toContain('11');
        // ...and the "Show history" button is still offered.
        expect(result.current.hasPreviousMessages).toBe(true);
    });
});
