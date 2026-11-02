import {openReport} from '@libs/actions/Report';
import {isReportApproved, isSettled} from '@libs/ReportUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';
import getEmptyArray from '@src/types/utils/getEmptyArray';

import type {OnyxCollection} from 'react-native-onyx';

import {guidedSetupAndTourStatusSelector} from '@selectors/Onboarding';
import {useEffect, useRef} from 'react';

import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useOnyx from './useOnyx';

type DuplicateReportsStatus = {
    hasSettledOrApprovedReport: boolean;
    hasUnloadedReport: boolean;
};

function getReport(reports: OnyxCollection<Report>, reportID: string) {
    return reports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
}

/** Reads the state of the duplicates' reports and opens the ones that aren't loaded yet. */
function useDuplicateReportsStatus(reportIDs: string[]): DuplicateReportsStatus {
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [conciergeChat] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${conciergeReportID}`);
    const [guidedSetupAndTourStatus] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: guidedSetupAndTourStatusSelector});
    const currentPersonalDetails = useCurrentUserPersonalDetails();
    const [missingReportIDs = getEmptyArray<string>()] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {
        selector: (reports) => reportIDs.filter((reportID) => !getReport(reports, reportID)),
    });
    const [hasSettledOrApprovedReport = false] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {
        selector: (reports) =>
            reportIDs.some((reportID) => {
                const report = getReport(reports, reportID);
                return isSettled(report) || isReportApproved({report});
            }),
    });
    const requestedReportIDs = useRef(new Set<string>());

    useEffect(() => {
        for (const reportID of missingReportIDs) {
            if (requestedReportIDs.current.has(reportID)) {
                continue;
            }
            requestedReportIDs.current.add(reportID);
            openReport({
                reportID,
                introSelected,
                conciergeChat,
                hasReportActions: false,
                currentUserAccountID: currentPersonalDetails.accountID,
                isSelfTourViewed: guidedSetupAndTourStatus?.isSelfTourViewed,
                hasCompletedGuidedSetupFlow: guidedSetupAndTourStatus?.hasCompletedGuidedSetupFlow,
                shouldMarkAsRead: false,
            });
        }
    }, [missingReportIDs, introSelected, conciergeChat, currentPersonalDetails.accountID, guidedSetupAndTourStatus?.isSelfTourViewed, guidedSetupAndTourStatus?.hasCompletedGuidedSetupFlow]);

    return {hasSettledOrApprovedReport, hasUnloadedReport: missingReportIDs.length > 0};
}

export default useDuplicateReportsStatus;
