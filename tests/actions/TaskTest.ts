import {renderHook} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import useReportIsArchived from '@hooks/useReportIsArchived';
import {canModifyTask} from '@libs/actions/Task';
import OnyxUpdateManager from '@src/libs/actions/OnyxUpdateManager';
import ONYXKEYS from '@src/ONYXKEYS';
import * as LHNTestUtils from '../utils/LHNTestUtils';

jest.mock('@components/ConfirmedRoute.tsx');

OnyxUpdateManager();
describe('actions/Task', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
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
});
