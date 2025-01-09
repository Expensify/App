import * as IOU from '@libs/actions/IOU';
import * as QuickActionNavigate from '@libs/actions/QuickActionNavigation';
import * as ReportUtils from '@libs/ReportUtils';
import CONST from '@src/CONST';

jest.mock('@libs/actions/IOU', () => ({
    startMoneyRequest: jest.fn(),
}));

describe('IOU Utils', () => {
    // Given navigateToQuickAction is called with quick action argument when clicking on quick action button from Global create menu
    describe('navigateToQuickAction', () => {
        const reportID = ReportUtils.generateReportID();

        it('should be navigated to Manual Submit Expense', () => {
            // When the quick action is REQUEST_MANUAL
            QuickActionNavigate.navigateToQuickAction(true, reportID, {action: CONST.QUICK_ACTIONS.REQUEST_MANUAL}, (onSelected: () => void) => {
                onSelected();
            });
            // Then we should start manual submit request flow
            expect(IOU.startMoneyRequest).toHaveBeenCalledWith(CONST.IOU.TYPE.SUBMIT, reportID, CONST.IOU.REQUEST_TYPE.MANUAL, true);
        });

        it('should be navigated to Scan receipt Split Expense', () => {
            // When the quick action is SPLIT_SCAN
            QuickActionNavigate.navigateToQuickAction(true, reportID, {action: CONST.QUICK_ACTIONS.SPLIT_SCAN}, (onSelected: () => void) => {
                onSelected();
            });
            // Then we should start scan split request flow
            expect(IOU.startMoneyRequest).toHaveBeenCalledWith(CONST.IOU.TYPE.SPLIT, reportID, CONST.IOU.REQUEST_TYPE.SCAN, true);
        });

        it('should be navigated to Track distance Expense', () => {
            // When the quick action is TRACK_DISTANCE
            QuickActionNavigate.navigateToQuickAction(true, reportID, {action: CONST.QUICK_ACTIONS.TRACK_DISTANCE}, (onSelected: () => void) => {
                onSelected();
            });
            // Then we should start distance track request flow
            expect(IOU.startMoneyRequest).toHaveBeenCalledWith(CONST.IOU.TYPE.TRACK, reportID, CONST.IOU.REQUEST_TYPE.DISTANCE, true);
        });
    });
});
