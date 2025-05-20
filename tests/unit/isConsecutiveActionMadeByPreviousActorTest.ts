import {isConsecutiveActionMadeByPreviousActor as isConsecutiveActionMadeByPreviousActorUtil} from '@libs/ReportActionsUtils';
import CONST from '@src/CONST';
import {getFakeReportAction} from '../utils/ReportTestUtils';

const currentUserAccountID = 1;
const mockReportActions = [getFakeReportAction(currentUserAccountID, CONST.REPORT.ACTIONS.TYPE.SUBMITTED), getFakeReportAction(2, CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT)];

describe('isConsecutiveActionMadeByPreviousActor', () => {
    it('should return false if the current action is SUBMITTED and the previous action was made by a different actor', () => {
        // When two consecutive report actions from different account IDs
        const isConsecutiveActionMadeByPreviousActor = isConsecutiveActionMadeByPreviousActorUtil(mockReportActions, 0);

        // Then, the isConsecutiveActionMadeByPreviousActorUtil function should return false
        expect(isConsecutiveActionMadeByPreviousActor).toBe(false);
    });
});
