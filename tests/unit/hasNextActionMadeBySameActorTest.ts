import {hasNextActionMadeBySameActor as hasNextActionMadeBySameActorUtil} from '@libs/ReportActionsUtils';
import CONST from '@src/CONST';
import {getFakeReportAction} from '../utils/ReportTestUtils';

const accountID = 1;

describe('hasNextActionMadeBySameActor', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    it("returns false if we're inspecting first item on the list", () => {
        const result = hasNextActionMadeBySameActorUtil([], 0, false);
        expect(result).toBe(false);
    });

    it('returns false if actions are more than 5 minutes apart', () => {
        const actions = [getFakeReportAction(accountID, {created: '2025-01-01T01:01:00Z'}), getFakeReportAction(accountID, {created: '2025-01-01T02:00:00Z'})];
        const result = hasNextActionMadeBySameActorUtil(actions, 1, false);
        expect(result).toBe(false);
    });

    it('returns false if next action is CREATED', () => {
        const actions = [getFakeReportAction(accountID, {actionName: CONST.REPORT.ACTIONS.TYPE.CREATED}), getFakeReportAction(accountID)];
        const result = hasNextActionMadeBySameActorUtil(actions, 1, false);
        expect(result).toBe(false);
    });

    it('returns false if either action is RENAMED', () => {
        const actions = [getFakeReportAction(accountID), getFakeReportAction(accountID, {actionName: CONST.REPORT.ACTIONS.TYPE.RENAMED})];
        expect(hasNextActionMadeBySameActorUtil(actions, 1, false)).toBe(false);
        expect(hasNextActionMadeBySameActorUtil(actions.toReversed(), 1, false)).toBe(false);
    });

    it('returns false if delegateAccountIDs differ', () => {
        const actions = [getFakeReportAction(accountID, {delegateAccountID: 100}), getFakeReportAction(accountID, {delegateAccountID: 101})];
        expect(hasNextActionMadeBySameActorUtil(actions, 1, false)).toBe(false);
    });

    it('returns false if report preview statuses are mismatched', () => {
        const actions = [getFakeReportAction(accountID, {actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW}), getFakeReportAction(accountID)];
        expect(hasNextActionMadeBySameActorUtil(actions, 1, false)).toBe(false);
        expect(hasNextActionMadeBySameActorUtil(actions.toReversed(), 1, false)).toBe(false);
    });

    it('returns false if the current action is SUBMITTED and the current action adminID is different than previous action actorID', () => {
        const actions = [getFakeReportAction(accountID, {adminAccountID: 3, actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT}), getFakeReportAction(2)];
        const isConsecutiveActionMadeByPreviousActor = hasNextActionMadeBySameActorUtil(actions, 1, false);

        expect(isConsecutiveActionMadeByPreviousActor).toBe(false);
    });

    it('returns false if the previous action is SUBMITTED and the previous action adminID is different than current action actorID', () => {
        const actions = [getFakeReportAction(2, {actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT}), getFakeReportAction(accountID, {adminAccountID: 3})];
        const isConsecutiveActionMadeByPreviousActor = hasNextActionMadeBySameActorUtil(actions, 1, false);

        expect(isConsecutiveActionMadeByPreviousActor).toBe(false);
    });

    it('returns false if the current action is SUBMITTED and the previous action was made by a different actor', () => {
        const actions = [getFakeReportAction(accountID), getFakeReportAction(2, {actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT})];
        const isConsecutiveActionMadeByPreviousActor = hasNextActionMadeBySameActorUtil(actions, 1, false);

        expect(isConsecutiveActionMadeByPreviousActor).toBe(false);
    });

    it('returns true if the current action is SUBMITTED and the previous action was made by the same actor', () => {
        const actions = [
            getFakeReportAction(accountID, {actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT}),
            getFakeReportAction(accountID, {actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT}),
        ];
        const isConsecutiveActionMadeByPreviousActor = hasNextActionMadeBySameActorUtil(actions, 1, false);

        expect(isConsecutiveActionMadeByPreviousActor).toBe(true);
    });

    it('skips pending-delete actions when online', () => {
        const actions = [getFakeReportAction(accountID), getFakeReportAction(accountID, {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}), getFakeReportAction(accountID)];
        const result = hasNextActionMadeBySameActorUtil(actions, 2, false);
        expect(result).toBe(true);
    });

    it('does not skip pending-delete actions when offline', () => {
        const actions = [getFakeReportAction(accountID), getFakeReportAction(2, {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}), getFakeReportAction(accountID)];
        // When offline, the pending-delete action by account 2 is not skipped, so next actor differs
        const result = hasNextActionMadeBySameActorUtil(actions, 2, true);
        expect(result).toBe(false);
    });
});
