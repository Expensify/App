import {renderHook} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import useReportIsArchived from '@hooks/useReportIsArchived';
import {canModifyTask, completeTestDriveTask, getFinishOnboardingTaskOnyxData} from '@libs/actions/Task';
// eslint-disable-next-line no-restricted-syntax -- this is required to allow mocking
import * as API from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';
import DateUtils from '@libs/DateUtils';
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

// This keeps the error "@rnmapbox/maps native code not available." from causing the tests to fail
jest.mock('@components/ConfirmedRoute.tsx');

OnyxUpdateManager();
describe('actions/Task', () => {
    beforeAll(async () => {
        Onyx.init({
            keys: ONYXKEYS,
        });
        initOnyxDerivedValues();
        await waitForBatchedUpdates();
    });

    describe('canModifyTask', () => {
        const managerAccountID = 1;
        const employeeAccountID = 2;

        // Report with a non-archived parent
        const report = LHNTestUtils.getFakeReport([managerAccountID, employeeAccountID]);
        const reportParent = LHNTestUtils.getFakeReport([managerAccountID, employeeAccountID]);

        // Cancelled report with a non-archived parent
        const cancelledTaskReport = LHNTestUtils.getFakeReport([managerAccountID, employeeAccountID]);
        const cancelledTaskReportParent = LHNTestUtils.getFakeReport([managerAccountID, employeeAccountID]);

        // Report with an archived parent
        const reportArchived = LHNTestUtils.getFakeReport([managerAccountID, employeeAccountID]);
        const reportArchivedParent = LHNTestUtils.getFakeReport([managerAccountID, employeeAccountID]);

        // Set the manager as the owner of each report
        report.ownerAccountID = managerAccountID;
        cancelledTaskReport.ownerAccountID = managerAccountID;
        reportArchived.ownerAccountID = managerAccountID;

        // Set the parent report ID of each report
        report.parentReportID = reportParent.reportID;
        cancelledTaskReport.parentReportID = cancelledTaskReportParent.reportID;
        reportArchived.parentReportID = reportArchivedParent.reportID;

        // This is what indicates that the report is a cancelled task report (see ReportUtils.isCanceledTaskReport())
        cancelledTaskReport.isDeletedParentAction = true;

        beforeAll(async () => {
            // Store all the necessary data in Onyx
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${reportParent.reportID}`, reportParent);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${cancelledTaskReport.reportID}`, cancelledTaskReport);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${cancelledTaskReportParent.reportID}`, cancelledTaskReportParent);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${reportArchived.reportID}`, reportArchived);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${reportArchivedParent.reportID}`, reportArchivedParent);

            // This is what indicates that a report is archived (see ReportUtils.isArchivedReport())
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportArchivedParent.reportID}`, {
                private_isArchived: new Date().toString(),
            });
        });

        it('returns false if the user modifying the task is not the author', () => {
            // Simulate how components call canModifyTask() by using the hook useReportIsArchived() to see if the report is archived
            const {result: isReportArchived} = renderHook(() => useReportIsArchived(report?.parentReportID));
            expect(canModifyTask(report, employeeAccountID, isReportArchived.current)).toBe(false);
        });
        it('returns false if the parent report is archived', () => {
            const {result: isReportArchived} = renderHook(() => useReportIsArchived(reportArchived?.parentReportID));
            expect(canModifyTask(reportArchived, managerAccountID, isReportArchived.current)).toBe(false);
        });
        it('returns false if the report is a cancelled task report', () => {
            const {result: isReportArchived} = renderHook(() => useReportIsArchived(cancelledTaskReport?.parentReportID));
            expect(canModifyTask(cancelledTaskReport, managerAccountID, isReportArchived.current)).toBe(false);
        });
        it('returns true if the user modifying the task is the author and the parent report is not archived or cancelled', () => {
            const {result: isReportArchived} = renderHook(() => useReportIsArchived(report?.parentReportID));
            expect(canModifyTask(report, managerAccountID, isReportArchived.current)).toBe(true);
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
