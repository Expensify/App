import * as IOU from '@libs/actions/IOU';
import * as QuickActionNavigate from '@libs/actions/QuickActionNavigation';
import * as ReportUtils from '@libs/ReportUtils';
import CONST from '@src/CONST';

jest.mock('@libs/actions/IOU', () => ({
    startMoneyRequest: jest.fn(),
}));

describe('IOU Utils', () => {
    describe('navigateToQuickAction', () => {
        const reportID = ReportUtils.generateReportID();

        it('should be navigated to Manual Submit Expense', () => {
            QuickActionNavigate.navigateToQuickAction(true, reportID, {action: CONST.QUICK_ACTIONS.REQUEST_MANUAL}, (onSelected: () => void) => {
                onSelected();
            });
            expect(IOU.startMoneyRequest).toHaveBeenCalledWith(CONST.IOU.TYPE.SUBMIT, reportID, CONST.IOU.REQUEST_TYPE.MANUAL, true);
        });

        it('should be navigated to Scan receipt Split Expense', () => {
            QuickActionNavigate.navigateToQuickAction(true, reportID, {action: CONST.QUICK_ACTIONS.SPLIT_SCAN}, (onSelected: () => void) => {
                onSelected();
            });
            expect(IOU.startMoneyRequest).toHaveBeenCalledWith(CONST.IOU.TYPE.SPLIT, reportID, CONST.IOU.REQUEST_TYPE.SCAN, true);
        });

        it('should be navigated to Track distance Expense', () => {
            QuickActionNavigate.navigateToQuickAction(true, reportID, {action: CONST.QUICK_ACTIONS.TRACK_DISTANCE}, (onSelected: () => void) => {
                onSelected();
            });
            expect(IOU.startMoneyRequest).toHaveBeenCalledWith(CONST.IOU.TYPE.TRACK, reportID, CONST.IOU.REQUEST_TYPE.DISTANCE, true);
        });
    });
});
