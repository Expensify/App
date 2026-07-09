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
        // Given a just-sent message whose created is skewed earlier than sessionStartTime, captured while pending.
        const skewedCreated = '2026-06-29 09:59:59.000';
        const pending = buildAction({reportActionID: '100', created: skewedCreated, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD});
        const {result, rerender} = renderHook(({actions}) => useCurrentSessionActionIDs(actions, CURRENT_USER_ACCOUNT_ID, SESSION_START_TIME), {
            initialProps: {actions: [pending]},
        });
        expect(result.current.has('100')).toBe(true);

        // When the success clears pendingAction (created stays skewed) before Concierge replies.
        const settled = buildAction({reportActionID: '100', created: skewedCreated, pendingAction: undefined});
        rerender({actions: [settled]});

        // Then the message is still recognized as a current-session message.
        expect(result.current.has('100')).toBe(true);
    });

    it("captures the Concierge reply that arrives after the user's question, even when its server timestamp is earlier (clock ahead of server)", () => {
        // Given a Concierge report with prior history loaded at session start.
        const history = buildAction({reportActionID: '1', actorAccountID: CONCIERGE_ACCOUNT_ID, created: '2026-06-29 08:00:00.000'});
        const {result, rerender} = renderHook(({actions}) => useCurrentSessionActionIDs(actions, CURRENT_USER_ACCOUNT_ID, SESSION_START_TIME), {
            initialProps: {actions: [history] as ReportAction[]},
        });
        // The prior history is not part of the current session.
        expect(result.current.has('1')).toBe(false);

        // When the user sends a question this session.
        const question = buildAction({reportActionID: '100', created: '2026-06-29 10:00:05.000', pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD});
        rerender({actions: [history, question]});
        expect(result.current.has('100')).toBe(true);

        // And Concierge replies with a server timestamp that lands before sessionStartTime (client clock ahead of server).
        const reply = buildAction({reportActionID: '200', actorAccountID: CONCIERGE_ACCOUNT_ID, created: '2026-06-29 09:59:58.000', pendingAction: undefined});
        rerender({actions: [history, question, reply]});

        // Then the reply is captured as a current-session action regardless of its timestamp.
        expect(result.current.has('200')).toBe(true);
        // And the prior history stays out of the session.
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

        // When a new session starts with no actions yet, the previous session's IDs are dropped.
        rerender({actions: [], sessionStartTime: '2026-06-29 12:00:00.000'});

        expect(result.current.has('100')).toBe(false);
    });
});
