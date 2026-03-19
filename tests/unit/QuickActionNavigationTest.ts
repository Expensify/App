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
                draftTransactionIDs: [],
            });

            // Then we should start manual submit request flow
            expect(startMoneyRequest).toHaveBeenCalledWith(CONST.IOU.TYPE.SUBMIT, reportID, [], CONST.IOU.REQUEST_TYPE.MANUAL, true, undefined, undefined);
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
                draftTransactionIDs: [],
            });

            // Then we should start scan split request flow
            expect(startMoneyRequest).toHaveBeenCalledWith(CONST.IOU.TYPE.SPLIT, reportID, [], CONST.IOU.REQUEST_TYPE.SCAN, true, undefined, undefined);
        });

        it('should be navigated to Track distance Expense', () => {
            const draftTransactionIDs: string[] = [];
            // When the quick action is TRACK_DISTANCE
            navigateToQuickAction({
                isValidReport: true,
                quickAction: {action: CONST.QUICK_ACTIONS.TRACK_DISTANCE, chatReportID: reportID},
                selectOption: (onSelected: () => void) => {
                    onSelected();
                },
                targetAccountPersonalDetails: createPersonalDetails(1),
                currentUserAccountID: CONST.DEFAULT_NUMBER_ID,
                draftTransactionIDs,
            });

            // Then we should start distance track request flow
            expect(startDistanceRequest).toHaveBeenCalledWith(CONST.IOU.TYPE.TRACK, reportID, draftTransactionIDs, CONST.IOU.REQUEST_TYPE.DISTANCE_MAP, true, undefined, undefined);
        });

        it('should be navigated to Map distance Expense by default', () => {
            const draftTransactionIDs: string[] = [];
            // When the quick action is REQUEST_DISTANCE
            navigateToQuickAction({
                isValidReport: true,
                quickAction: {action: CONST.QUICK_ACTIONS.REQUEST_DISTANCE, chatReportID: reportID},
                selectOption: (onSelected: () => void) => {
                    onSelected();
                },
                targetAccountPersonalDetails: createPersonalDetails(1),
                currentUserAccountID: CONST.DEFAULT_NUMBER_ID,
                draftTransactionIDs,
            });

            // Then we should start map distance request flow
            expect(startDistanceRequest).toHaveBeenCalledWith(CONST.IOU.TYPE.SUBMIT, reportID, draftTransactionIDs, CONST.IOU.REQUEST_TYPE.DISTANCE_MAP, true, undefined, undefined);
        });

        it('should be navigated to request distance Expense depending on lastDistanceExpenseType', () => {
            const draftTransactionIDs: string[] = [];
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
                draftTransactionIDs,
            });

            // Then we should start manual distance request flow
            expect(startDistanceRequest).toHaveBeenCalledWith(CONST.IOU.TYPE.SUBMIT, reportID, draftTransactionIDs, CONST.IOU.REQUEST_TYPE.DISTANCE_MANUAL, true, undefined, undefined);
        });

        it('should pass draftTransactionIDs with existing drafts to startDistanceRequest for TRACK_DISTANCE', () => {
            // Given draftTransactionIDs with some existing draft IDs
            const draftTransactionIDs = ['123'];
            // When the quick action is TRACK_DISTANCE
            navigateToQuickAction({
                isValidReport: true,
                quickAction: {action: CONST.QUICK_ACTIONS.TRACK_DISTANCE, chatReportID: reportID},
                selectOption: (onSelected: () => void) => {
                    onSelected();
                },
                targetAccountPersonalDetails: createPersonalDetails(1),
                currentUserAccountID: CONST.DEFAULT_NUMBER_ID,
                draftTransactionIDs,
            });

            // Then startDistanceRequest should be called with the draftTransactionIDs
            expect(startDistanceRequest).toHaveBeenCalledWith(CONST.IOU.TYPE.TRACK, reportID, draftTransactionIDs, CONST.IOU.REQUEST_TYPE.DISTANCE_MAP, true, undefined, undefined);
        });

        it('should pass draftTransactionIDs with existing drafts to startDistanceRequest for REQUEST_DISTANCE', () => {
            // Given draftTransactionIDs with some existing draft IDs
            const draftTransactionIDs = ['456'];
            // When the quick action is REQUEST_DISTANCE
            navigateToQuickAction({
                isValidReport: true,
                quickAction: {action: CONST.QUICK_ACTIONS.REQUEST_DISTANCE, chatReportID: reportID},
                selectOption: (onSelected: () => void) => {
                    onSelected();
                },
                targetAccountPersonalDetails: createPersonalDetails(1),
                currentUserAccountID: CONST.DEFAULT_NUMBER_ID,
                draftTransactionIDs,
            });

            // Then startDistanceRequest should be called with the draftTransactionIDs
            expect(startDistanceRequest).toHaveBeenCalledWith(CONST.IOU.TYPE.SUBMIT, reportID, draftTransactionIDs, CONST.IOU.REQUEST_TYPE.DISTANCE_MAP, true, undefined, undefined);
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
                draftTransactionIDs: [],
            });

            // Then we should start per diem request flow
            expect(startMoneyRequest).toHaveBeenCalledWith(CONST.IOU.TYPE.SUBMIT, reportID, [], CONST.IOU.REQUEST_TYPE.PER_DIEM, true, undefined, undefined);
        });

        it('should be navigated to Time Expense', () => {
            // When the quick action is REQUEST_TIME
            navigateToQuickAction({
                isValidReport: true,
                quickAction: {action: CONST.QUICK_ACTIONS.REQUEST_TIME, chatReportID: reportID},
                selectOption: (onSelected: () => void) => {
                    onSelected();
                },
                targetAccountPersonalDetails: createPersonalDetails(1),
                currentUserAccountID: CONST.DEFAULT_NUMBER_ID,
                draftTransactionIDs: [],
            });

            // Then we should start time request flow
            expect(startMoneyRequest).toHaveBeenCalledWith(CONST.IOU.TYPE.SUBMIT, reportID, [], CONST.IOU.REQUEST_TYPE.TIME, false, undefined, undefined);
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
                draftTransactionIDs: [],
            });
            expect(startOutCreateTaskQuickAction).toHaveBeenCalled();
        });
    });
});
