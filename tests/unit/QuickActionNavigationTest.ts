import {startDistanceRequest, startMoneyRequest} from '@libs/actions/IOU';
import {navigateToQuickAction} from '@libs/actions/QuickActionNavigation';
import {startOutCreateTaskQuickAction} from '@libs/actions/Task';
import {generateReportID} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import createPersonalDetails from '../utils/collections/personalDetails';

jest.mock('@libs/actions/IOU', () => ({
    startMoneyRequest: jest.fn(),
    startDistanceRequest: jest.fn(),
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
            navigateToQuickAction({
                isValidReport: true,
                quickAction: {action: CONST.QUICK_ACTIONS.REQUEST_MANUAL, chatReportID: reportID},
                selectOption: (onSelected: () => void) => {
                    onSelected();
                },
                targetAccountPersonalDetails: createPersonalDetails(1),
                currentUserAccountID: CONST.DEFAULT_NUMBER_ID,
            });

            // Then we should start manual submit request flow
            expect(startMoneyRequest).toHaveBeenCalledWith(CONST.IOU.TYPE.SUBMIT, reportID, CONST.IOU.REQUEST_TYPE.MANUAL, true);
        });

        it('should be navigated to Scan receipt Split Expense', () => {
            // When the quick action is SPLIT_SCAN
            navigateToQuickAction({
                isValidReport: true,
                quickAction: {action: CONST.QUICK_ACTIONS.SPLIT_SCAN, chatReportID: reportID},
                selectOption: (onSelected: () => void) => {
                    onSelected();
                },
                targetAccountPersonalDetails: createPersonalDetails(1),
                currentUserAccountID: CONST.DEFAULT_NUMBER_ID,
            });

            // Then we should start scan split request flow
            expect(startMoneyRequest).toHaveBeenCalledWith(CONST.IOU.TYPE.SPLIT, reportID, CONST.IOU.REQUEST_TYPE.SCAN, true);
        });

        it('should be navigated to Track distance Expense', () => {
            // When the quick action is TRACK_DISTANCE
            navigateToQuickAction({
                isValidReport: true,
                quickAction: {action: CONST.QUICK_ACTIONS.TRACK_DISTANCE, chatReportID: reportID},
                selectOption: (onSelected: () => void) => {
                    onSelected();
                },
                targetAccountPersonalDetails: createPersonalDetails(1),
                currentUserAccountID: CONST.DEFAULT_NUMBER_ID,
            });

            // Then we should start distance track request flow
            expect(startDistanceRequest).toHaveBeenCalledWith(CONST.IOU.TYPE.TRACK, reportID, CONST.IOU.REQUEST_TYPE.DISTANCE_MAP, true);
        });

        it('should be navigated to Map distance Expense by default', () => {
            // When the quick action is REQUEST_DISTANCE
            navigateToQuickAction({
                isValidReport: true,
                quickAction: {action: CONST.QUICK_ACTIONS.REQUEST_DISTANCE, chatReportID: reportID},
                selectOption: (onSelected: () => void) => {
                    onSelected();
                },
                targetAccountPersonalDetails: createPersonalDetails(1),
                currentUserAccountID: CONST.DEFAULT_NUMBER_ID,
            });

            // Then we should start map distance request flow
            expect(startDistanceRequest).toHaveBeenCalledWith(CONST.IOU.TYPE.SUBMIT, reportID, CONST.IOU.REQUEST_TYPE.DISTANCE_MAP, true);
        });

        it('should be navigated to request distance Expense depending on lastDistanceExpenseType', () => {
            // When the quick action is REQUEST_DISTANCE
            navigateToQuickAction({
                isValidReport: true,
                quickAction: {action: CONST.QUICK_ACTIONS.REQUEST_DISTANCE, chatReportID: reportID},
                selectOption: (onSelected: () => void) => {
                    onSelected();
                },
                targetAccountPersonalDetails: createPersonalDetails(1),
                lastDistanceExpenseType: CONST.IOU.REQUEST_TYPE.DISTANCE_MANUAL,
                currentUserAccountID: CONST.DEFAULT_NUMBER_ID,
            });

            // Then we should start manual distance request flow
            expect(startDistanceRequest).toHaveBeenCalledWith(CONST.IOU.TYPE.SUBMIT, reportID, CONST.IOU.REQUEST_TYPE.DISTANCE_MANUAL, true);
        });

        it('should be navigated to Per Diem Expense', () => {
            // When the quick action is PER_DIEM
            navigateToQuickAction({
                isValidReport: true,
                quickAction: {action: CONST.QUICK_ACTIONS.PER_DIEM, chatReportID: reportID},
                selectOption: (onSelected: () => void) => {
                    onSelected();
                },
                targetAccountPersonalDetails: createPersonalDetails(1),
                currentUserAccountID: CONST.DEFAULT_NUMBER_ID,
            });

            // Then we should start per diem request flow
            expect(startMoneyRequest).toHaveBeenCalledWith(CONST.IOU.TYPE.SUBMIT, reportID, CONST.IOU.REQUEST_TYPE.PER_DIEM, true);
        });
    });
});

describe('Non IOU quickActions test:', () => {
    describe('navigateToQuickAction', () => {
        it('starts create task flow for "assignTask" quick action', () => {
            navigateToQuickAction({
                isValidReport: true,
                quickAction: {action: CONST.QUICK_ACTIONS.ASSIGN_TASK, targetAccountID: 123},
                selectOption: (onSelected: () => void) => {
                    onSelected();
                },
                targetAccountPersonalDetails: createPersonalDetails(123),
                currentUserAccountID: CONST.DEFAULT_NUMBER_ID,
            });
            expect(startOutCreateTaskQuickAction).toHaveBeenCalled();
        });
    });
});
