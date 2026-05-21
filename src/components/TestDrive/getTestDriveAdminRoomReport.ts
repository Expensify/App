import {isAdminRoom} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import type {Report} from '@src/types/onyx';

function isValidReportID(reportID: string | undefined): boolean {
    return !!reportID && reportID !== CONST.DEFAULT_NUMBER_ID.toString();
}

function getTestDriveAdminRoomReport(...reports: Array<Report | null | undefined>): Report | undefined {
    for (const report of reports) {
        if (!report) {
            continue;
        }

        if (isValidReportID(report.reportID) && isAdminRoom(report)) {
            return report;
        }
    }

    return undefined;
}

export default getTestDriveAdminRoomReport;
