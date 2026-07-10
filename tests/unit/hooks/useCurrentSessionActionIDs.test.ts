import {renderHook} from '@testing-library/react-native';

import useCurrentSessionActionIDs from '@hooks/useCurrentSessionActionIDs';

import CONST from '@src/CONST';
import type {ReportAction} from '@src/types/onyx';

import createRandomReportAction from '../../utils/collections/reportActions';

const CURRENT_USER_ACCOUNT_ID = 1;
const CONCIERGE_ACCOUNT_ID = 2;
const SESSION_START_TIME = '2026-06-29 10:00:00.000';

function buildAction(overrides: Partial<ReportAction>): ReportAction {
    return {...createRandomReportAction(1), reportActionID: '100', actorAccountID: CURRENT_USER_ACCOUNT_ID, created: SESSION_START_TIME, pendingAction: undefined, ...overrides};
}

describe('useCurrentSessionActionIDs', () => {
    it("captures the current user's optimistic ADD action ID", () => {
        const action = buildAction({reportActionID: '100', pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD});

        const {result} = renderHook(() => useCurrentSessionActionIDs([action], CURRENT_USER_ACCOUNT_ID, SESSION_START_TIME));

        expect(result.current.has('100')).toBe(true);
    });

    it('retains the ID after pendingAction is cleared by the AddComment success (the clock-skew race)', () => {
        // Given a skewed just-sent message (created < sessionStartTime), captured while pending.
        const skewedCreated = '2026-06-29 09:59:59.000';
        const pending = buildAction({reportActionID: '100', created: skewedCreated, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD});
        const {result, rerender} = renderHook(({actions}) => useCurrentSessionActionIDs(actions, CURRENT_USER_ACCOUNT_ID, SESSION_START_TIME), {
            initialProps: {actions: [pending]},
        });
        expect(result.current.has('100')).toBe(true);

        // When success clears pendingAction (created stays skewed) before Concierge replies.
        const settled = buildAction({reportActionID: '100', created: skewedCreated, pendingAction: undefined});
        rerender({actions: [settled]});

        // Then it's still a current-session message.
        expect(result.current.has('100')).toBe(true);
    });

    it("captures the Concierge reply that arrives after the user's question, even when its server timestamp is earlier (clock ahead of server)", () => {
        // Given prior history loaded at session start.
        const history = buildAction({reportActionID: '1', actorAccountID: CONCIERGE_ACCOUNT_ID, created: '2026-06-29 08:00:00.000'});
        const {result, rerender} = renderHook(({actions}) => useCurrentSessionActionIDs(actions, CURRENT_USER_ACCOUNT_ID, SESSION_START_TIME), {
            initialProps: {actions: [history] as ReportAction[]},
        });
        // Prior history isn't part of the session.
        expect(result.current.has('1')).toBe(false);

        // When the user sends a question this session.
        const question = buildAction({reportActionID: '100', created: '2026-06-29 10:00:05.000', pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD});
        rerender({actions: [history, question]});
        expect(result.current.has('100')).toBe(true);

        // And Concierge replies with a server timestamp before sessionStartTime (clock ahead of server).
        const reply = buildAction({reportActionID: '200', actorAccountID: CONCIERGE_ACCOUNT_ID, created: '2026-06-29 09:59:58.000', pendingAction: undefined});
        rerender({actions: [history, question, reply]});

        // Then the reply is captured regardless of its timestamp.
        expect(result.current.has('200')).toBe(true);
        // And prior history stays out.
        expect(result.current.has('1')).toBe(false);
    });

    it('does not capture older history that loads after the first message when no pre-session baseline exists', () => {
        // Given the panel opens with no actions loaded yet.
        const {result, rerender} = renderHook(({actions}) => useCurrentSessionActionIDs(actions, CURRENT_USER_ACCOUNT_ID, SESSION_START_TIME), {
            initialProps: {actions: [] as ReportAction[]},
        });

        // When the user sends the first message this session (no prior server history seen).
        const question = buildAction({reportActionID: '100', created: '2026-06-29 10:00:05.000', pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD});
        rerender({actions: [question]});
        expect(result.current.has('100')).toBe(true);

        // And older Concierge history lazy-loads afterwards (created before the session).
        const olderHistory = buildAction({reportActionID: '1', actorAccountID: CONCIERGE_ACCOUNT_ID, created: '2026-06-29 08:00:00.000', pendingAction: undefined});
        rerender({actions: [olderHistory, question]});

        // Then that history is not treated as part of the current session.
        expect(result.current.has('1')).toBe(false);
    });

    it("does not capture other actors' messages before the user has sent anything this session", () => {
        const concierge = buildAction({reportActionID: '200', actorAccountID: CONCIERGE_ACCOUNT_ID, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD});
        const deleting = buildAction({reportActionID: '300', pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE});

        const {result} = renderHook(() => useCurrentSessionActionIDs([concierge, deleting], CURRENT_USER_ACCOUNT_ID, SESSION_START_TIME));

        expect(result.current.has('200')).toBe(false);
        expect(result.current.has('300')).toBe(false);
    });

    it('resets the captured IDs when the session boundary changes', () => {
        const action = buildAction({reportActionID: '100', pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD});
        const {result, rerender} = renderHook(({actions, sessionStartTime}) => useCurrentSessionActionIDs(actions, CURRENT_USER_ACCOUNT_ID, sessionStartTime), {
            initialProps: {actions: [action], sessionStartTime: SESSION_START_TIME as string | null},
        });
        expect(result.current.has('100')).toBe(true);

        // When a new session starts with no actions, the previous IDs are dropped.
        rerender({actions: [], sessionStartTime: '2026-06-29 12:00:00.000'});

        expect(result.current.has('100')).toBe(false);
    });
});
