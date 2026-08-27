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
            isConciergeMainDM: false,
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

describe('useConciergeSidePanelReportActions (main DM open-task pinning)', () => {
    const SESSION_START = toDBTime(CLIENT_OPEN_MS);

    /** Builds the parent action of a task, carrying the child* fields the backend stamps on it. */
    function buildTaskAction(reportActionID: string, stateNum: ReportAction['childStateNum'], statusNum: ReportAction['childStatusNum']): ReportAction {
        return buildAction(reportActionID, {
            actorAccountID: CONCIERGE_ACCOUNT_ID,
            created: toDBTime(CLIENT_OPEN_MS - 3_400_000),
            childType: CONST.REPORT.TYPE.TASK,
            childReportID: `task-${reportActionID}`,
            childStateNum: stateNum,
            childStatusNum: statusNum,
        });
    }

    /**
     * @param hasSessionActivity when false, nothing has happened in this session yet — the fresh-session welcome
     * state, where `filterActions` returns early before the session filter runs.
     */
    function renderMainDM(taskAction: ReportAction, hasSessionActivity = true) {
        const createdAction = buildAction('10', {actionName: CONST.REPORT.ACTIONS.TYPE.CREATED, created: toDBTime(CLIENT_OPEN_MS - 7_200_000)});
        const preSessionUser = buildAction('11', {created: toDBTime(CLIENT_OPEN_MS - 3_600_000)});
        const preSessionConcierge = buildAction('12', {actorAccountID: CONCIERGE_ACCOUNT_ID, created: toDBTime(CLIENT_OPEN_MS - 3_500_000)});
        const inSessionUser = buildAction('20', {created: toDBTime(CLIENT_OPEN_MS + 1000)});
        const reportActions = [createdAction, preSessionUser, preSessionConcierge, taskAction, ...(hasSessionActivity ? [inSessionUser] : [])];

        // `hasOutstandingChildTask` no longer reaches this hook as `showFullHistory` — the pin below is what keeps
        // the task reachable, so the rest of the read history can stay collapsed behind "Show history".
        const report: Report = {...createRandomReport(Number(REPORT_ID)), reportID: REPORT_ID, lastReadTime: SESSION_START, hasOutstandingChildTask: true};

        return renderHook(() =>
            useConciergeSidePanelReportActions({
                report,
                reportActions,
                visibleReportActions: reportActions,
                isConciergeHiddenHistory: true,
                hasUserSentMessage: hasSessionActivity,
                hasOlderActions: false,
                sessionStartTime: SESSION_START,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                greetingText: 'Hi there, how can I help?',
                loadOlderChats: jest.fn(),
                isConciergeMainDM: true,
                showFullHistory: false,
                hadMessagesAtSessionStart: hasSessionActivity,
            }),
        );
    }

    it('keeps a still-open child task visible while the rest of the read history stays hidden', () => {
        // Given a pre-session task that the user has not completed yet
        const {result} = renderMainDM(buildTaskAction('30', CONST.REPORT.STATE_NUM.OPEN, CONST.REPORT.STATUS_NUM.OPEN));

        // When the main DM filters the session's actions
        const visibleIDs = result.current.filteredReportActions.map((action) => action.reportActionID);

        // Then the task stays pinned, the read history stays hidden, and "Show history" is still offered.
        expect(visibleIDs).toContain('30');
        expect(visibleIDs).toContain('20');
        expect(visibleIDs).not.toContain('11');
        expect(visibleIDs).not.toContain('12');
        expect(result.current.showFullHistory).toBe(false);
        expect(result.current.hasPreviousMessages).toBe(true);
    });

    it('keeps a still-open child task visible in the fresh-session welcome state', () => {
        // Given the DM is opened with nothing sent yet — the welcome state, which used to return early with just the
        // greeting and drop the pinned task
        const {result} = renderMainDM(buildTaskAction('30', CONST.REPORT.STATE_NUM.OPEN, CONST.REPORT.STATUS_NUM.OPEN), false);

        // When the main DM filters the session's actions
        const visibleIDs = result.current.filteredReportActions.map((action) => action.reportActionID);

        // Then the welcome state stands down so the task renders, while the read history stays hidden.
        expect(result.current.showConciergeSidePanelWelcome).toBe(false);
        expect(visibleIDs).toContain('30');
        expect(visibleIDs).not.toContain('11');
        expect(visibleIDs).not.toContain('12');
    });

    it('hides a completed child task along with the rest of the read history', () => {
        // Given a pre-session task that has already been completed
        const {result} = renderMainDM(buildTaskAction('30', CONST.REPORT.STATE_NUM.APPROVED, CONST.REPORT.STATUS_NUM.APPROVED));

        // When the main DM filters the session's actions
        const visibleIDs = result.current.filteredReportActions.map((action) => action.reportActionID);

        // Then it is treated as ordinary read history and collapses behind "Show history".
        expect(visibleIDs).not.toContain('30');
        expect(visibleIDs).not.toContain('11');
        expect(visibleIDs).toContain('20');
    });
});
