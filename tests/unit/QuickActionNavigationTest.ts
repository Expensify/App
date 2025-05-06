import {startMoneyRequest} from '@libs/actions/IOU';
import {navigateToQuickAction} from '@libs/actions/QuickActionNavigation';
import {createNewReport} from '@libs/actions/Report';
import {startOutCreateTaskQuickAction} from '@libs/actions/Task';
import {generateReportID} from '@libs/ReportUtils';
import CONST from '@src/CONST';

jest.mock('@libs/actions/IOU', () => ({
    startMoneyRequest: jest.fn(),
}));
jest.mock('@libs/actions/Report', () => ({
    createNewReport: jest.fn(),
}));
jest.mock('@libs/actions/Task', () => ({
    startOutCreateTaskQuickAction: jest.fn(),
}));

describe('IOU Utils', () => {
    // Given navigateToQuickAction is called with quick action argument when clicking on quick action button from Global create menu
    describe('navigateToQuickAction', () => {
        const reportID = generateReportID();

        it('should be navigated to Manual Submit Expense', () => {
            // When the quick action is REQUEST_MANUAL
            navigateToQuickAction(true, {action: CONST.QUICK_ACTIONS.REQUEST_MANUAL, chatReportID: reportID}, {accountID: 1234}, undefined, (onSelected: () => void) => {
                onSelected();
            });
            // Then we should start manual submit request flow
            expect(startMoneyRequest).toHaveBeenCalledWith(CONST.IOU.TYPE.SUBMIT, reportID, CONST.IOU.REQUEST_TYPE.MANUAL, true);
        });

        it('should be navigated to Scan receipt Split Expense', () => {
            // When the quick action is SPLIT_SCAN
            navigateToQuickAction(true, {action: CONST.QUICK_ACTIONS.SPLIT_SCAN, chatReportID: reportID}, {accountID: 1234}, undefined, (onSelected: () => void) => {
                onSelected();
            });
            // Then we should start scan split request flow
            expect(startMoneyRequest).toHaveBeenCalledWith(CONST.IOU.TYPE.SPLIT, reportID, CONST.IOU.REQUEST_TYPE.SCAN, true);
        });

        it('should be navigated to Track distance Expense', () => {
            // When the quick action is TRACK_DISTANCE
            navigateToQuickAction(true, {action: CONST.QUICK_ACTIONS.TRACK_DISTANCE, chatReportID: reportID}, {accountID: 1234}, undefined, (onSelected: () => void) => {
                onSelected();
            });
            // Then we should start distance track request flow
            expect(startMoneyRequest).toHaveBeenCalledWith(CONST.IOU.TYPE.TRACK, reportID, CONST.IOU.REQUEST_TYPE.DISTANCE, true);
        });

        it('should be navigated to Per Diem Expense', () => {
            // When the quick action is PER_DIEM
            navigateToQuickAction(true, {action: CONST.QUICK_ACTIONS.PER_DIEM, chatReportID: reportID}, {accountID: 1234}, undefined, (onSelected: () => void) => {
                onSelected();
            });
            // Then we should start per diem request flow
            expect(startMoneyRequest).toHaveBeenCalledWith(CONST.IOU.TYPE.SUBMIT, reportID, CONST.IOU.REQUEST_TYPE.PER_DIEM, true);
        });
    });
});

describe('Non IOU quickActions test:', () => {
    const reportID = generateReportID();

    describe('navigateToQuickAction', () => {
        it('creates new report for "createReport" quick action', () => {
            navigateToQuickAction(true, {action: CONST.QUICK_ACTIONS.CREATE_REPORT, chatReportID: reportID}, {accountID: 1234}, undefined, (onSelected: () => void) => {
                onSelected();
            });
            expect(createNewReport).toHaveBeenCalled();
        });
        it('starts create task flow for "assignTask" quick action', () => {
            navigateToQuickAction(true, {action: CONST.QUICK_ACTIONS.ASSIGN_TASK, targetAccountID: 123}, {accountID: 1234}, undefined, (onSelected: () => void) => {
                onSelected();
            });
            expect(startOutCreateTaskQuickAction).toHaveBeenCalled();
        });
    });
});
