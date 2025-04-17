import Onyx from 'react-native-onyx';
import {getFakeReport} from 'tests/utils/LHNTestUtils';
import {canModifyTask} from '@libs/actions/Task';
import OnyxUpdateManager from '@src/libs/actions/OnyxUpdateManager';
import ONYXKEYS from '@src/ONYXKEYS';

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
        const report = getFakeReport([managerAccountID, employeeAccountID]);
        const archivedReport = getFakeReport([managerAccountID, employeeAccountID]);
        const cancelledTaskReport = getFakeReport([managerAccountID, employeeAccountID]);

        beforeAll(async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${archivedReport.reportID}`, archivedReport);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${cancelledTaskReport.reportID}`, cancelledTaskReport);

            // Set First conciergeChatReport1 to archived state
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${archivedReport.reportID}`, {
                private_isArchived: new Date().toString(),
            });
        });

        it('returns false if the user modifying the task is not the author', () => {
            canModifyTask();
        });
        it('returns false if the parent report is archived', () => {});
        it('returns false if the report is a cancelled task report', () => {});
        it('returns true if the user modifying the task is the author and the parent report is not archived or cancelled', () => {});
    });
});
