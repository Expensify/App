import {renderHook} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import useParentReport from '@hooks/useParentReport';
import useReportIsArchived from '@hooks/useReportIsArchived';
import {canActionTask, canModifyTask, completeTestDriveTask, getFinishOnboardingTaskOnyxData} from '@libs/actions/Task';
// eslint-disable-next-line no-restricted-syntax -- this is required to allow mocking
import * as API from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';
import DateUtils from '@libs/DateUtils';
import Parser from '@libs/Parser';
import initOnyxDerivedValues from '@userActions/OnyxDerived';
import CONST, {getTestDriveTaskName} from '@src/CONST';
import OnyxUpdateManager from '@src/libs/actions/OnyxUpdateManager';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Report, ReportAction} from '@src/types/onyx';
import type {ReportCollectionDataSet} from '@src/types/onyx/Report';
import type {ReportActionsCollectionDataSet} from '@src/types/onyx/ReportAction';
import * as LHNTestUtils from '../utils/LHNTestUtils';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

OnyxUpdateManager();
describe('actions/Task', () => {
    beforeAll(async () => {
        Onyx.init({
            keys: ONYXKEYS,
        });
        initOnyxDerivedValues();
        await waitForBatchedUpdates();
    });

    describe('canModify and canAction task', () => {
        const managerAccountID = 1;
        const employeeAccountID = 2;
        const taskAssigneeAccountID = 3;

        // TaskReport with a non-archived parent
        const taskReport = {...LHNTestUtils.getFakeReport([managerAccountID, employeeAccountID]), type: CONST.REPORT.TYPE.TASK};
        const taskReportParent = LHNTestUtils.getFakeReport([managerAccountID, employeeAccountID]);

        // Cancelled Task report with a non-archived parent
        const taskReportCancelled = {...LHNTestUtils.getFakeReport([managerAccountID, employeeAccountID]), type: CONST.REPORT.TYPE.TASK};
        const taskReportCancelledParent = LHNTestUtils.getFakeReport([managerAccountID, employeeAccountID]);

        // Task report with an archived parent
        const taskReportArchived = {...LHNTestUtils.getFakeReport([managerAccountID, employeeAccountID]), type: CONST.REPORT.TYPE.TASK};
        const taskReportArchivedParent = LHNTestUtils.getFakeReport([managerAccountID, employeeAccountID]);

        // This report has no parent
        const taskReportWithNoParent = {...LHNTestUtils.getFakeReport([managerAccountID, employeeAccountID]), type: CONST.REPORT.TYPE.TASK};

        // Set the manager as the owner of each report
        taskReport.ownerAccountID = managerAccountID;
        taskReportCancelled.ownerAccountID = managerAccountID;
        taskReportArchived.ownerAccountID = managerAccountID;
        taskReportWithNoParent.ownerAccountID = managerAccountID;

        // Set the parent report ID of each report
        taskReport.parentReportID = taskReportParent.reportID;
        taskReportCancelled.parentReportID = taskReportCancelledParent.reportID;
        taskReportArchived.parentReportID = taskReportArchivedParent.reportID;

        // This is what indicates that the report is a cancelled task report (see ReportUtils.isCanceledTaskReport())
        taskReportCancelled.isDeletedParentAction = true;

        beforeAll(async () => {
            Onyx.init({
                keys: ONYXKEYS,
            });
            initOnyxDerivedValues();

            // Store all the necessary data in Onyx
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${taskReportWithNoParent.reportID}`, taskReportWithNoParent);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${taskReport.reportID}`, taskReport);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${taskReportParent.reportID}`, taskReportParent);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${taskReportCancelled.reportID}`, taskReportCancelled);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${taskReportCancelledParent.reportID}`, taskReportCancelledParent);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${taskReportArchived.reportID}`, taskReportArchived);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${taskReportArchivedParent.reportID}`, taskReportArchivedParent);

            // This is what indicates that a report is archived (see ReportUtils.isArchivedReport())
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${taskReportArchivedParent.reportID}`, {
                private_isArchived: new Date().toString(),
            });

            await waitForBatchedUpdates();
        });

        describe('canModifyTask', () => {
            it('returns false if the user modifying the task is not the author', () => {
                // Simulate how components call canModifyTask() by using the hook useReportIsArchived() to see if the report is archived
                const {result: isReportArchived} = renderHook(() => useReportIsArchived(taskReport?.parentReportID));
                expect(canModifyTask(taskReport, employeeAccountID, isReportArchived.current)).toBe(false);
            });
            it('returns false if the parent report is archived', () => {
                const {result: isReportArchived} = renderHook(() => useReportIsArchived(taskReportArchived?.parentReportID));
                expect(canModifyTask(taskReportArchived, managerAccountID, isReportArchived.current)).toBe(false);
            });
            it('returns false if the report is a cancelled task report', () => {
                const {result: isReportArchived} = renderHook(() => useReportIsArchived(taskReportCancelled?.parentReportID));
                expect(canModifyTask(taskReportCancelled, managerAccountID, isReportArchived.current)).toBe(false);
            });
            it('returns true if the user modifying the task is the author and the parent report is not archived or cancelled', () => {
                const {result: isReportArchived} = renderHook(() => useReportIsArchived(taskReport?.parentReportID));
                expect(canModifyTask(taskReport, managerAccountID, isReportArchived.current)).toBe(true);
            });
        });

        describe('canActionTask', () => {
            it('returns false if there is no logged in user', () => {
                expect(canActionTask(taskReportCancelled)).toBe(false);
            });

            it('returns false if the report is a cancelled task report', () => {
                // The accountID doesn't matter here because the code will do an early return for the cancelled report
                expect(canActionTask(taskReportCancelled, 0)).toBe(false);
            });

            it('returns false if the report has an archived parent report', () => {
                // The accountID doesn't matter here because the code will do an early return for the archived report
                expect(canActionTask(taskReportArchived, 0)).toBe(false);
            });

            it('returns false if the user modifying the task is not the author', () => {
                const {result: parentReport} = renderHook(() => useParentReport(taskReport.reportID));
                const {result: isParentReportArchived} = renderHook(() => useReportIsArchived(parentReport.current?.reportID));
                expect(canActionTask(taskReport, employeeAccountID, parentReport.current, isParentReportArchived.current)).toBe(false);
            });

            it('returns true if the user modifying the task is the author', () => {
                const {result: parentReport} = renderHook(() => useParentReport(taskReport.reportID));
                const {result: isParentReportArchived} = renderHook(() => useReportIsArchived(parentReport.current?.reportID));
                expect(canActionTask(taskReport, managerAccountID, parentReport.current, isParentReportArchived.current)).toBe(true);
            });

            // Looking up the task assignee is usually based on the report action
            describe('testing with report action', () => {
                beforeAll(async () => {
                    taskReport.parentReportActionID = 'a1';
                    await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${taskReport.reportID}`, taskReport);

                    // Given that the task is assigned to a user who is not the author of the task
                    await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${taskReport.parentReportID}`, {
                        a1: {
                            ...LHNTestUtils.getFakeReportAction(),
                            reportID: taskReport.parentReportID,
                            childManagerAccountID: taskAssigneeAccountID,
                        },
                    });
                });

                it('returns false if the logged in user is not the author or the one assigned to the task', () => {
                    const {result: parentReport} = renderHook(() => useParentReport(taskReport.reportID));
                    const {result: isParentReportArchived} = renderHook(() => useReportIsArchived(parentReport.current?.reportID));
                    expect(canActionTask(taskReport, employeeAccountID, parentReport.current, isParentReportArchived.current)).toBe(false);
                });

                it('returns true if the logged in user is the one assigned to the task', () => {
                    const {result: parentReport} = renderHook(() => useParentReport(taskReport.reportID));
                    const {result: isParentReportArchived} = renderHook(() => useReportIsArchived(parentReport.current?.reportID));
                    expect(canActionTask(taskReport, taskAssigneeAccountID, parentReport.current, isParentReportArchived.current)).toBe(true);
                });
            });

            // Some old reports might only have report.managerID so be sure it's still supported
            describe('testing with report.managerID', () => {
                beforeAll(async () => {
                    taskReport.managerID = taskAssigneeAccountID;
                    await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${taskReport.reportID}`, taskReport);
                });

                it('returns false if the logged in user is not the author or the one assigned to the task', () => {
                    const {result: parentReport} = renderHook(() => useParentReport(taskReport.reportID));
                    const {result: isParentReportArchived} = renderHook(() => useReportIsArchived(parentReport.current?.reportID));
                    expect(canActionTask(taskReport, employeeAccountID, parentReport.current, isParentReportArchived.current)).toBe(false);
                });

                it('returns true if the logged in user is the one assigned to the task', () => {
                    const {result: parentReport} = renderHook(() => useParentReport(taskReport.reportID));
                    const {result: isParentReportArchived} = renderHook(() => useReportIsArchived(parentReport.current?.reportID));
                    expect(canActionTask(taskReport, taskAssigneeAccountID, parentReport.current, isParentReportArchived.current)).toBe(true);
                });
            });
        });
    });

    describe('completeTestDriveTask', () => {
        const accountID = 2;
        const conciergeChatReport: Report = LHNTestUtils.getFakeReport([accountID, CONST.ACCOUNT_ID.CONCIERGE]);
        const testDriveTaskReport: Report = {...LHNTestUtils.getFakeReport(), ownerAccountID: accountID};
        const testDriveTaskAction: ReportAction = {
            ...LHNTestUtils.getFakeReportAction(),
            childType: CONST.REPORT.TYPE.TASK,
            childReportName: Parser.replace(getTestDriveTaskName(`${CONST.STAGING_NEW_EXPENSIFY_URL}/${ROUTES.TEST_DRIVE_DEMO_ROOT}`)),
            childReportID: testDriveTaskReport.reportID,
        };

        const reportCollectionDataSet: ReportCollectionDataSet = {
            [`${ONYXKEYS.COLLECTION.REPORT}${testDriveTaskReport.reportID}`]: testDriveTaskReport,
            [`${ONYXKEYS.COLLECTION.REPORT}${conciergeChatReport.reportID}`]: conciergeChatReport,
        };

        const reportActionsCollectionDataSet: ReportActionsCollectionDataSet = {
            [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${conciergeChatReport.reportID}`]: {
                [testDriveTaskAction.reportActionID]: testDriveTaskAction,
            },
        };

        beforeEach(async () => {
            await Onyx.clear();
            await Onyx.multiSet({
                ...reportCollectionDataSet,
                ...reportActionsCollectionDataSet,
                [ONYXKEYS.NVP_INTRO_SELECTED]: {
                    viewTour: testDriveTaskReport.reportID,
                },
                [ONYXKEYS.SESSION]: {
                    accountID,
                },
            });
            await waitForBatchedUpdates();
        });

        it('Completes test drive task', () => {
            const writeSpy = jest.spyOn(API, 'write');

            completeTestDriveTask(testDriveTaskReport, testDriveTaskReport.reportID);

            expect(writeSpy).toHaveBeenCalledWith(WRITE_COMMANDS.COMPLETE_TASK, expect.anything(), expect.anything());
        });
    });

    describe('getFinishOnboardingTaskOnyxData', () => {
        const parentReport: Report = LHNTestUtils.getFakeReport();
        const taskReport: Report = {...LHNTestUtils.getFakeReport(), type: CONST.REPORT.TYPE.TASK, ownerAccountID: 1, managerID: 2, parentReportID: parentReport.reportID};
        const reportCollectionDataSet: ReportCollectionDataSet = {
            [`${ONYXKEYS.COLLECTION.REPORT}${taskReport.reportID}`]: taskReport,
            [`${ONYXKEYS.COLLECTION.REPORT}${parentReport.reportID}`]: parentReport,
        };
        beforeEach(async () => {
            await Onyx.clear();
            await Onyx.multiSet({
                ...reportCollectionDataSet,
            });
            await Onyx.set(ONYXKEYS.SESSION, {email: 'user1@gmail.com', accountID: 2});
            await Onyx.set(`${ONYXKEYS.NVP_INTRO_SELECTED}`, {choice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM, setupCategories: taskReport.reportID});
            await waitForBatchedUpdates();
        });
        it('Return not empty object', () => {
            expect(Object.values(getFinishOnboardingTaskOnyxData('setupCategories')).length).toBeGreaterThan(0);
        });
        it('Return empty object', async () => {
            const reportNameValuePairs = {
                private_isArchived: DateUtils.getDBTime(),
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${parentReport.reportID}`, reportNameValuePairs);
            await waitForBatchedUpdates();
            expect(Object.values(getFinishOnboardingTaskOnyxData('setupCategories')).length).toBe(0);
        });
    });
});
