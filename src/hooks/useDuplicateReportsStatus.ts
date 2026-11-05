/**
 * Tells the duplicate review whether any duplicate's report is settled, approved or not loaded yet, so the review can
 * decide whether Keep selected is safe.
 */
import {isReportApproved, isSettled} from '@libs/ReportUtils';

import ONYXKEYS from '@src/ONYXKEYS';

import useOnyx from './useOnyx';

type DuplicateReportsStatus = {
    hasSettledOrApprovedReport: boolean;
    hasUnloadedReport: boolean;
};

const DEFAULT_STATUS: DuplicateReportsStatus = {hasSettledOrApprovedReport: false, hasUnloadedReport: false};

function useDuplicateReportsStatus(reportIDs: string[]): DuplicateReportsStatus {
    const [status = DEFAULT_STATUS] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {
        selector: (reports) => {
            let hasSettledOrApprovedReport = false;
            let hasUnloadedReport = false;
            for (const reportID of reportIDs) {
                const report = reports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
                if (!report) {
                    hasUnloadedReport = true;
                } else if (isSettled(report) || isReportApproved({report})) {
                    hasSettledOrApprovedReport = true;
                }
            }
            return {hasSettledOrApprovedReport, hasUnloadedReport};
        },
    });

    return status;
}

export default useDuplicateReportsStatus;
