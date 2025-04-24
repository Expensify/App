import {renderHook} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import useParentReport from '@hooks/useParentReport';
import useReportIsArchived from '@hooks/useReportIsArchived';
import {canActionTask, canModifyTask, completeTestDriveTask} from '@libs/actions/Task';
// eslint-disable-next-line no-restricted-syntax -- this is required to allow mocking
import * as API from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';
import Parser from '@libs/Parser';
// eslint-disable-next-line no-restricted-syntax -- this is required to allow mocking
import * as ReportUtils from '@libs/ReportUtils';
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

jest.mock('@components/ConfirmedRoute.tsx');

OnyxUpdateManager();
describe('actions/Task', () => {
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
            it('returns false if the report is a cancelled task report', () => {
                const {result: parentReport} = renderHook(() => useParentReport(taskReportCancelled.reportID));
                const {result: isParentReportArchived} = renderHook(() => useReportIsArchived(parentReport.current?.reportID));

                // The accountID doesn't matter here because the code will do an early return for the cancelled report
                expect(canActionTask(taskReportCancelled, 0, undefined, undefined, parentReport.current, isParentReportArchived.current)).toBe(false);
            });

            it('returns false if the report has an archived parent report', () => {
                const {result: parentReport} = renderHook(() => useParentReport(taskReportArchived.reportID));
                const {result: isParentReportArchived} = renderHook(() => useReportIsArchived(parentReport.current?.reportID));

                // The accountID doesn't matter here because the code will do an early return for the archived report
                expect(canActionTask(taskReportArchived, 0, undefined, undefined, parentReport.current, isParentReportArchived.current)).toBe(false);
            });

            it('returns false if the user modifying the task is not the author', () => {
                const {result: parentReport} = renderHook(() => useParentReport(taskReport.reportID));
                const {result: isParentReportArchived} = renderHook(() => useReportIsArchived(parentReport.current?.reportID));
                expect(canActionTask(taskReport, employeeAccountID, undefined, undefined, parentReport.current, isParentReportArchived.current)).toBe(false);
            });

            it('returns true if the user modifying the task is the author', () => {
                const {result: parentReport} = renderHook(() => useParentReport(taskReport.reportID));
                const {result: isParentReportArchived} = renderHook(() => useReportIsArchived(parentReport.current?.reportID));
                expect(canActionTask(taskReport, managerAccountID, undefined, undefined, parentReport.current, isParentReportArchived.current)).toBe(true);
            });

            // The third parameter of canActionTask is the accountID of the user who is assigned to the task
            // and is used when the task report has no parent
            describe('testing the third parameter', () => {
                it('returns true if the report has no parent and the third parameter is the same as the second', () => {
                    const {result: parentReport} = renderHook(() => useParentReport(taskReportWithNoParent.reportID));
                    const {result: isParentReportArchived} = renderHook(() => useReportIsArchived(parentReport.current?.reportID));
                    expect(canActionTask(taskReportWithNoParent, managerAccountID, undefined, undefined, parentReport.current, isParentReportArchived.current)).toBe(true);
                });

                it('returns false if the report has no parent, the logged on user is not the author or assignee', () => {
                    const {result: parentReport} = renderHook(() => useParentReport(taskReportWithNoParent.reportID));
                    const {result: isParentReportArchived} = renderHook(() => useReportIsArchived(parentReport.current?.reportID));
                    expect(canActionTask(taskReportWithNoParent, employeeAccountID, undefined, undefined, parentReport.current, isParentReportArchived.current)).toBe(false);
                });

                it('returns false if the report has no parent, the logged on user is not the author or assignee', () => {
                    const {result: parentReport} = renderHook(() => useParentReport(taskReportWithNoParent.reportID));
                    const {result: isParentReportArchived} = renderHook(() => useReportIsArchived(parentReport.current?.reportID));
                    expect(canActionTask(taskReportWithNoParent, employeeAccountID, undefined, undefined, parentReport.current, isParentReportArchived.current)).toBe(false);
                });
            });

            // When the third parameter is not passed, the function uses childManagerAccountID of the parent report action
            // to indicate the user assigned to the task
            describe('testing without the third parameter and report action', () => {
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
                    expect(canActionTask(taskReport, employeeAccountID, undefined, undefined, parentReport.current, isParentReportArchived.current)).toBe(false);
                });

                it('returns true if the logged in user is the one assigned to the task', () => {
                    const {result: parentReport} = renderHook(() => useParentReport(taskReport.reportID));
                    const {result: isParentReportArchived} = renderHook(() => useReportIsArchived(parentReport.current?.reportID));
                    expect(canActionTask(taskReport, taskAssigneeAccountID, undefined, undefined, parentReport.current, isParentReportArchived.current)).toBe(true);
                });
            });

            // When the third parameter is not passed, the function uses report.managerID
            // to indicate the user assigned to the task
            describe('testing without the third parameter and report.managerId', () => {
                beforeAll(async () => {
                    taskReport.managerID = taskAssigneeAccountID;
                    await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${taskReport.reportID}`, taskReport);
                });

                it('returns false if the logged in user is not the author or the one assigned to the task', () => {
                    expect(canActionTask(taskReport, employeeAccountID)).toBe(false);
                });

                it('returns true if the logged in user is the one assigned to the task', () => {
                    expect(canActionTask(taskReport, taskAssigneeAccountID)).toBe(true);
                });
            });
        });
    });

    describe('completeTestDriveTask', () => {
        const accountID = 2;
        const conciergeChatReport: Report = LHNTestUtils.getFakeReport([accountID, CONST.ACCOUNT_ID.CONCIERGE]);
        const testDriveTaskReport: Report = LHNTestUtils.getFakeReport();
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
            });
            await waitForBatchedUpdates();
        });

        it('Uses concierge room', () => {
            const getChatUsedForOnboardingSpy = jest.spyOn(ReportUtils, 'getChatUsedForOnboarding');

            completeTestDriveTask();

            expect(getChatUsedForOnboardingSpy).toHaveReturnedWith(conciergeChatReport);
        });

        it('Completes test drive task', () => {
            const writeSpy = jest.spyOn(API, 'write');

            completeTestDriveTask();

            expect(writeSpy).toHaveBeenCalledWith(WRITE_COMMANDS.COMPLETE_TASK, expect.anything(), expect.anything());
        });
    });
});
