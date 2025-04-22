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
        const report = LHNTestUtils.getFakeReport([managerAccountID, employeeAccountID]);
        const archivedReport = LHNTestUtils.getFakeReport([managerAccountID, employeeAccountID]);
        const cancelledTaskReport = LHNTestUtils.getFakeReport([managerAccountID, employeeAccountID]);

        // Set the manager as the owner of each report
        report.ownerAccountID = managerAccountID;
        archivedReport.ownerAccountID = managerAccountID;
        cancelledTaskReport.ownerAccountID = managerAccountID;

        // This is what indicates that the report is a cancelled task report (see ReportUtils.isCanceledTaskReport())
        cancelledTaskReport.isDeletedParentAction = true;

        beforeAll(async () => {
            // Store all the necessary data in Onyx
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${archivedReport.reportID}`, archivedReport);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${cancelledTaskReport.reportID}`, cancelledTaskReport);

            // This is what indicates that a report is archived (see ReportUtils.isArchivedReport())
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${archivedReport.reportID}`, {
                private_isArchived: new Date().toString(),
            });
        });

        it('returns false if the user modifying the task is not the author', () => {
            // Simulate how components call canModifyTask() by using the hook useReportIsArchived() to see if the report is archived
            const {result: isReportArchived} = renderHook(() => useReportIsArchived(report?.reportID));
            expect(canModifyTask(report, employeeAccountID, undefined, isReportArchived.current)).toBe(false);
        });
        it('returns false if the parent report is archived', () => {
            const {result: isReportArchived} = renderHook(() => useReportIsArchived(archivedReport?.reportID));
            expect(canModifyTask(archivedReport, managerAccountID, undefined, isReportArchived.current)).toBe(false);
        });
        it('returns false if the report is a cancelled task report', () => {
            const {result: isReportArchived} = renderHook(() => useReportIsArchived(cancelledTaskReport?.reportID));
            expect(canModifyTask(cancelledTaskReport, managerAccountID, undefined, isReportArchived.current)).toBe(false);
        });
        it('returns true if the user modifying the task is the author and the parent report is not archived or cancelled', () => {
            const {result: isReportArchived} = renderHook(() => useReportIsArchived(report?.reportID));
            expect(canModifyTask(report, managerAccountID, undefined, isReportArchived.current)).toBe(true);
        });
    });
});
