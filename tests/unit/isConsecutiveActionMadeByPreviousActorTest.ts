import {isConsecutiveActionMadeByPreviousActor as isConsecutiveActionMadeByPreviousActorUtil} from '@libs/ReportActionsUtils';
import CONST from '@src/CONST';
import {getFakeReportAction} from '../utils/ReportTestUtils';

const accountID = 1;
const conciergeAccountID = CONST.ACCOUNT_ID.CONCIERGE;

describe('isConsecutiveActionMadeByPreviousActor', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns false if current action is missing', () => {
        const result = isConsecutiveActionMadeByPreviousActorUtil([getFakeReportAction(accountID)], 0, false);
        expect(result).toBe(false);
    });

    it('returns false if actions are more than 5 minutes apart', () => {
        const actions = [getFakeReportAction(accountID, {created: '2025-01-01T02:00:00Z'}), getFakeReportAction(accountID, {created: '2025-01-01T01:01:00Z'})];
        const result = isConsecutiveActionMadeByPreviousActorUtil(actions, 0, false);
        expect(result).toBe(false);
    });

    it('returns false if previous action is CREATED', () => {
        const actions = [getFakeReportAction(accountID), getFakeReportAction(accountID, {actionName: CONST.REPORT.ACTIONS.TYPE.CREATED})];
        const result = isConsecutiveActionMadeByPreviousActorUtil(actions, 0, false);
        expect(result).toBe(false);
    });

    it('returns false if either action is RENAMED', () => {
        const actions = [getFakeReportAction(accountID), getFakeReportAction(accountID, {actionName: CONST.REPORT.ACTIONS.TYPE.RENAMED})];
        expect(isConsecutiveActionMadeByPreviousActorUtil(actions, 0, false)).toBe(false);
        expect(isConsecutiveActionMadeByPreviousActorUtil(actions.toReversed(), 0, false)).toBe(false);
    });

    it('returns false if delegateAccountIDs differ', () => {
        const actions = [getFakeReportAction(accountID, {delegateAccountID: 100}), getFakeReportAction(accountID, {delegateAccountID: 101})];
        expect(isConsecutiveActionMadeByPreviousActorUtil(actions, 0, false)).toBe(false);
    });

    it('returns false if report preview statuses are mismatched', () => {
        const actions = [getFakeReportAction(accountID, {actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW}), getFakeReportAction(accountID)];
        expect(isConsecutiveActionMadeByPreviousActorUtil(actions, 0, false)).toBe(false);
        expect(isConsecutiveActionMadeByPreviousActorUtil(actions.toReversed(), 0, false)).toBe(false);
    });

    it('returns false if the current action is SUBMITTED and the current action adminID is different than previous action actorID', () => {
        const actions = [getFakeReportAction(accountID, {adminAccountID: 3}), getFakeReportAction(2)];
        const isConsecutiveActionMadeByPreviousActor = isConsecutiveActionMadeByPreviousActorUtil(actions, 0, false);

        expect(isConsecutiveActionMadeByPreviousActor).toBe(false);
    });
    it('returns false if the current action is SUBMITTED and the current action adminID is different than previous action actorID', () => {
        const actions = [getFakeReportAction(accountID, {adminAccountID: 3}), getFakeReportAction(2)];
        const isConsecutiveActionMadeByPreviousActor = isConsecutiveActionMadeByPreviousActorUtil(actions, 0, false);

        expect(isConsecutiveActionMadeByPreviousActor).toBe(false);
    });
    it('returns false if the previous action is SUBMITTED and the previous action adminID is different than current action actorID', () => {
        const actions = [getFakeReportAction(2, {actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT}), getFakeReportAction(accountID, {adminAccountID: 3})];
        const isConsecutiveActionMadeByPreviousActor = isConsecutiveActionMadeByPreviousActorUtil(actions, 0, false);

        expect(isConsecutiveActionMadeByPreviousActor).toBe(false);
    });
    it('returns false if the current action is SUBMITTED and the previous action was made by a different actor', () => {
        const actions = [getFakeReportAction(accountID), getFakeReportAction(2)];
        const isConsecutiveActionMadeByPreviousActor = isConsecutiveActionMadeByPreviousActorUtil(actions, 0, false);

        expect(isConsecutiveActionMadeByPreviousActor).toBe(false);
    });
    it('returns true if the current action is SUBMITTED and the previous action was made by the same actor', () => {
        const actions = [
            getFakeReportAction(accountID, {actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT}),
            getFakeReportAction(accountID, {actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT}),
        ];
        const isConsecutiveActionMadeByPreviousActor = isConsecutiveActionMadeByPreviousActorUtil(actions, 0, false);

        expect(isConsecutiveActionMadeByPreviousActor).toBe(true);
    });

    it('skips pending-delete actions when online', () => {
        const actions = [getFakeReportAction(accountID), getFakeReportAction(accountID, {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}), getFakeReportAction(accountID)];
        const result = isConsecutiveActionMadeByPreviousActorUtil(actions, 0, false);
        expect(result).toBe(true);
    });

    it('does not skip pending-delete actions when offline', () => {
        const actions = [getFakeReportAction(accountID), getFakeReportAction(2, {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}), getFakeReportAction(accountID)];
        // When offline, the pending-delete action by account 2 is not skipped, so previous actor differs
        const result = isConsecutiveActionMadeByPreviousActorUtil(actions, 0, true);
        expect(result).toBe(false);
    });

    it('returns false when humanAgentAccountID changes between consecutive Concierge messages', () => {
        const humanAssistedMessage = getFakeReportAction(conciergeAccountID, {
            actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
            originalMessage: {html: 'I am a human agent', lastModified: '2023-09-12T16:27:35Z', humanAgentAccountID: 42, whisperedTo: []},
        });
        const normalConciergeMessage = getFakeReportAction(conciergeAccountID, {
            actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
            originalMessage: {html: 'I am Concierge', lastModified: '2023-09-12T16:27:35Z', whisperedTo: []},
        });
        const actions = [normalConciergeMessage, humanAssistedMessage];
        expect(isConsecutiveActionMadeByPreviousActorUtil(actions, 0, false)).toBe(false);
    });

    it('returns true when consecutive Concierge messages both have the same humanAgentAccountID', () => {
        const humanAssistedMessage1 = getFakeReportAction(conciergeAccountID, {
            actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
            originalMessage: {html: 'Human message 1', lastModified: '2023-09-12T16:27:35Z', humanAgentAccountID: 42, whisperedTo: []},
        });
        const humanAssistedMessage2 = getFakeReportAction(conciergeAccountID, {
            actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
            originalMessage: {html: 'Human message 2', lastModified: '2023-09-12T16:27:35Z', humanAgentAccountID: 42, whisperedTo: []},
        });
        const actions = [humanAssistedMessage2, humanAssistedMessage1];
        expect(isConsecutiveActionMadeByPreviousActorUtil(actions, 0, false)).toBe(true);
    });

    it('returns true when consecutive Concierge messages both lack humanAgentAccountID', () => {
        const conciergeMessage1 = getFakeReportAction(conciergeAccountID, {
            actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
            originalMessage: {html: 'Concierge message 1', lastModified: '2023-09-12T16:27:35Z', whisperedTo: []},
        });
        const conciergeMessage2 = getFakeReportAction(conciergeAccountID, {
            actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
            originalMessage: {html: 'Concierge message 2', lastModified: '2023-09-12T16:27:35Z', whisperedTo: []},
        });
        const actions = [conciergeMessage2, conciergeMessage1];
        expect(isConsecutiveActionMadeByPreviousActorUtil(actions, 0, false)).toBe(true);
    });
});
