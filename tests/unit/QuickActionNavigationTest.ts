import {startMoneyRequest} from '@libs/actions/IOU';
import {navigateToQuickAction} from '@libs/actions/QuickActionNavigation';
import {generateReportID} from '@libs/ReportUtils';
import CONST from '@src/CONST';

jest.mock('@libs/actions/IOU', () => ({
    startMoneyRequest: jest.fn(),
}));

describe('IOU Utils', () => {
    // Given navigateToQuickAction is called with quick action argument when clicking on quick action button from Global create menu
    describe('navigateToQuickAction', () => {
        const reportID = generateReportID();

        it('should be navigated to Manual Submit Expense', () => {
            // When the quick action is REQUEST_MANUAL
            navigateToQuickAction(true, reportID, {action: CONST.QUICK_ACTIONS.REQUEST_MANUAL}, (onSelected: () => void) => {
                onSelected();
            });
            // Then we should start manual submit request flow
            expect(startMoneyRequest).toHaveBeenCalledWith(CONST.IOU.TYPE.SUBMIT, reportID, CONST.IOU.REQUEST_TYPE.MANUAL, true);
        });

        it('should be navigated to Scan receipt Split Expense', () => {
            // When the quick action is SPLIT_SCAN
            navigateToQuickAction(true, reportID, {action: CONST.QUICK_ACTIONS.SPLIT_SCAN}, (onSelected: () => void) => {
                onSelected();
            });
            // Then we should start scan split request flow
            expect(startMoneyRequest).toHaveBeenCalledWith(CONST.IOU.TYPE.SPLIT, reportID, CONST.IOU.REQUEST_TYPE.SCAN, true);
        });

        it('should be navigated to Track distance Expense', () => {
            // When the quick action is TRACK_DISTANCE
            navigateToQuickAction(true, reportID, {action: CONST.QUICK_ACTIONS.TRACK_DISTANCE}, (onSelected: () => void) => {
                onSelected();
            });
            // Then we should start distance track request flow
            expect(startMoneyRequest).toHaveBeenCalledWith(CONST.IOU.TYPE.TRACK, reportID, CONST.IOU.REQUEST_TYPE.DISTANCE, true);
        });

        it('should be navigated to Per Diem Expense', () => {
            // When the quick action is PER_DIEM
            navigateToQuickAction(true, reportID, {action: CONST.QUICK_ACTIONS.PER_DIEM}, (onSelected: () => void) => {
                onSelected();
            });
            // Then we should start per diem request flow
            expect(startMoneyRequest).toHaveBeenCalledWith(CONST.IOU.TYPE.SUBMIT, reportID, CONST.IOU.REQUEST_TYPE.PER_DIEM, true);
        });
    });
});
