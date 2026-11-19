/** Whether the user can open a report shown above a thread, and a function that opens it at the shown message. */
import {canCurrentUserOpenReport, canUserPerformWriteAction, hasExpensifyGuidesEmails, navigateToLinkedReportAction} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction} from '@src/types/onyx';

import useNetwork from './useNetwork';
import useOnyx from './useOnyx';
import usePermissions from './usePermissions';
import useResponsiveLayout from './useResponsiveLayout';

type OpenAncestorReport = {
    /** Whether the user can open the report */
    canOpenAncestorReport: boolean;

    /** Opens the report at the shown message */
    openAncestorReport: (isArchived: boolean) => void;
};

function useOpenAncestorReport(report: Report, reportAction: ReportAction, shouldDisplayNewMarker: boolean, isAncestorReportArchived: boolean): OpenAncestorReport {
    const [guideAccountIDs] = useOnyx(ONYXKEYS.DERIVED.GUIDE_ACCOUNT_IDS);
    const {isBetaEnabled} = usePermissions();
    const {isOffline} = useNetwork();
    const {isInNarrowPaneModal} = useResponsiveLayout();
    const hasGuidesEmails = hasExpensifyGuidesEmails(Object.keys(report?.participants ?? {}).map(Number), guideAccountIDs);

    const openAncestorReport = (isArchived: boolean) => {
        navigateToLinkedReportAction({report, reportAction, shouldDisplayNewMarker}, isInNarrowPaneModal, canUserPerformWriteAction(report, isArchived), isOffline);
    };

    return {
        canOpenAncestorReport: canCurrentUserOpenReport(report, isBetaEnabled(CONST.BETAS.DEFAULT_ROOMS), hasGuidesEmails, isAncestorReportArchived),
        openAncestorReport,
    };
}

export default useOpenAncestorReport;
