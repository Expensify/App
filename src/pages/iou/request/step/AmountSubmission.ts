import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import {isParticipantP2P} from '@libs/IOUUtils';
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
 *
 * Intended for submit-time call sites (e.g. inside `navigateToNextPage`) where the caches are
 * guaranteed to be hydrated. For render-time reads where a stale cache would silently misreport
 * a value, use `useReportOrReportDraft` instead so the screen re-renders when the report arrives.
 */
function getReportOrReportDraftForAmount(reportID: string | undefined): OnyxEntry<OnyxTypes.Report> {
    if (!reportID) {
        return undefined;
    }
    return allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`] ?? allReportDrafts?.[`${ONYXKEYS.COLLECTION.REPORT_DRAFT}${reportID}`];
}

type GetIsP2PForAmountArgs = {
    chatReportForP2P: OnyxEntry<OnyxTypes.Report>;
    currentUserAccountID: number | undefined;
};

/**
 * Determines whether the first participant of `chatReportForP2P` is a P2P participant.
 * The caller is responsible for resolving the correct chat report (e.g. via reactive
 * `useReportOrReportDraft` hooks for editing flows where the transaction thread must be
 * traversed to the actual chat report).
 */
function getIsP2PForAmount({chatReportForP2P, currentUserAccountID}: GetIsP2PForAmountArgs): boolean {
    const firstParticipant = getMoneyRequestParticipantsFromReport(chatReportForP2P, currentUserAccountID).at(0);
    return isParticipantP2P(firstParticipant);
}

export {getIsP2PForAmount, getReportOrReportDraftForAmount};
