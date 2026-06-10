import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import {isParticipantP2P} from '@libs/IOUUtils';
import {isMoneyRequestReport} from '@libs/ReportUtils';
import {getMoneyRequestParticipantsFromReport} from '@userActions/IOU/MoneyRequest';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';

// `allReports` and `allReportDrafts` are only consumed by submit-time helpers in this module,
// never during render. Onyx.connectWithoutView is appropriate. If React components need these
// values, use useOnyx instead.

let allReports: OnyxCollection<OnyxTypes.Report>;
Onyx.connectWithoutView({
    key: ONYXKEYS.COLLECTION.REPORT,
    waitForCollectionCallback: true,
    callback: (value) => (allReports = value),
});

let allReportDrafts: OnyxCollection<OnyxTypes.Report>;
Onyx.connectWithoutView({
    key: ONYXKEYS.COLLECTION.REPORT_DRAFT,
    waitForCollectionCallback: true,
    callback: (value) => (allReportDrafts = value),
});

/**
 * Look up a report by ID across the cached `COLLECTION.REPORT` and `COLLECTION.REPORT_DRAFT`
 * collections. Returns the report-draft entry when no concrete report exists for the ID.
 */
function getReportOrReportDraftForAmount(reportID: string | undefined): OnyxEntry<OnyxTypes.Report> {
    if (!reportID) {
        return undefined;
    }
    return allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`] ?? allReportDrafts?.[`${ONYXKEYS.COLLECTION.REPORT_DRAFT}${reportID}`];
}

// When editing, the `report` is the transaction thread which only has the current user as participant.
// To correctly determine if this is a P2P expense, we need to traverse to the actual chat report
// (e.g., the 1:1 DM) via the IOU/expense report's chatReportID.
// Reads from module-cached collections — non-reactive, but safe because the screen re-renders
// when its `report` prop changes, re-running this helper against the latest cache state.
function getChatReportForP2PCheck(report: OnyxEntry<OnyxTypes.Report>, isEditing: boolean): OnyxEntry<OnyxTypes.Report> {
    if (!isEditing) {
        return report;
    }

    // When editing, report is the transaction thread. We need to get the actual chat report.
    // Transaction thread's chatReportID points to the IOU/expense report,
    // and the IOU/expense report's chatReportID points to the actual chat.
    const iouOrExpenseReport = getReportOrReportDraftForAmount(report?.chatReportID);
    if (iouOrExpenseReport && isMoneyRequestReport(iouOrExpenseReport) && iouOrExpenseReport.chatReportID) {
        return getReportOrReportDraftForAmount(iouOrExpenseReport.chatReportID);
    }

    // Fallback to the passed report if we can't traverse
    return report;
}

type GetIsP2PForAmountArgs = {
    report: OnyxEntry<OnyxTypes.Report>;
    isEditing: boolean;
    currentUserAccountID: number | undefined;
};

/**
 * Sync helper consumed by `IOURequestStepAmount` at render time to determine the `isP2P` prop
 * passed to `MoneyRequestAmountForm`. Reads from module-cached `allReports` / `allReportDrafts`
 * instead of subscribing to the full REPORT / REPORT_DRAFT collections at the screen level.
 */
function getIsP2PForAmount({report, isEditing, currentUserAccountID}: GetIsP2PForAmountArgs): boolean {
    const chatReportForP2PCheck = getChatReportForP2PCheck(report, isEditing);
    const firstParticipant = getMoneyRequestParticipantsFromReport(chatReportForP2PCheck, currentUserAccountID).at(0);
    return isParticipantP2P(firstParticipant);
}

export {getIsP2PForAmount, getReportOrReportDraftForAmount};
