import {getParticipantsChatKey, isOneOnOneChat, isSystemChat} from '@libs/ReportUtils';

import createOnyxDerivedValueConfig from '@userActions/OnyxDerived/createOnyxDerivedValueConfig';

import ONYXKEYS from '@src/ONYXKEYS';
import type {OneOnOneChatReportIDsDerivedValue} from '@src/types/onyx';
import type Report from '@src/types/onyx/Report';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

function getIndexableParticipantsKey(report: OnyxEntry<Report>, currentUserAccountID: number): string | undefined {
    if (!report?.reportID || (!isOneOnOneChat(report, currentUserAccountID) && !isSystemChat(report))) {
        return undefined;
    }
    return getParticipantsChatKey(Object.keys(report.participants ?? {}).map(Number));
}

/**
 * The first report in collection order wins a key, matching `getChatByParticipants`. When `keysToFind` is passed,
 * only those keys are looked up.
 */
function buildIndex(reports: NonNullable<OnyxCollection<Report>>, currentUserAccountID: number, keysToFind?: Set<string>): OneOnOneChatReportIDsDerivedValue['reportIDs'] {
    const index: OneOnOneChatReportIDsDerivedValue['reportIDs'] = {};
    for (const report of Object.values(reports)) {
        const participantsKey = getIndexableParticipantsKey(report, currentUserAccountID);
        if (!participantsKey || !report?.reportID || index[participantsKey] || (keysToFind && !keysToFind.has(participantsKey))) {
            continue;
        }
        index[participantsKey] = report.reportID;
    }
    return index;
}

/**
 * Indexes 1:1 and system chats by participant set.
 *
 * Reports are keyed by reportID, so `getChatByParticipants` has to walk the whole collection to find a chat by its
 * participants. This index answers the same question with a lookup. Group chats are excluded because
 * `getChatByParticipants` only returns those behind `shouldIncludeGroupChats`.
 *
 * All state lives in the derived value; nothing is kept in module scope between computes.
 */
export default createOnyxDerivedValueConfig({
    key: ONYXKEYS.DERIVED.ONE_ON_ONE_CHAT_REPORT_IDS,
    // `isOneOnOneChat` needs the current accountID to tell a DM from a group chat, so SESSION has to be a
    // dependency. Without it the index gets built before the ID arrives and every two-participant DM is missing.
    dependencies: [ONYXKEYS.COLLECTION.REPORT, ONYXKEYS.SESSION],
    compute: ([reports, session], {sourceValues, currentValue}) => {
        const currentUserAccountID = session?.accountID;

        // Without the accountID every DM looks like a group chat, so an index built now would be thrown away.
        if (!reports || !currentUserAccountID) {
            return {reportIDs: {}};
        }

        // The first flush after a reload has no `sourceValues`. The restored index can disagree with the restored
        // reports, because the two are written separately and reports that change before the subscriptions connect
        // never show up in a delta, so it is rebuilt rather than trusted.
        if (!currentValue || !sourceValues || currentValue.accountID !== currentUserAccountID) {
            return {reportIDs: buildIndex(reports, currentUserAccountID), accountID: currentUserAccountID};
        }

        const reportUpdates = sourceValues[ONYXKEYS.COLLECTION.REPORT];
        if (!reportUpdates) {
            return currentValue;
        }

        const updatedIndex: OneOnOneChatReportIDsDerivedValue['reportIDs'] = {...currentValue.reportIDs};
        let keyByReportID: Record<string, string> | undefined;
        // Keys whose report left, refilled from `reports` after the loop. The server's `preexistingReportID`
        // replacement keeps an optimistic DM and the real one on the same participants for a moment, so dropping the
        // key would lose the chat that remains.
        const keysToRefill = new Set<string>();

        for (const reportKey of Object.keys(reportUpdates)) {
            const reportID = reportKey.slice(ONYXKEYS.COLLECTION.REPORT.length);
            // From the full collection, because a delta entry carries only the changed fields.
            const nextKey = getIndexableParticipantsKey(reports[reportKey], currentUserAccountID);

            if (nextKey && updatedIndex[nextKey] === reportID) {
                continue;
            }

            keyByReportID ??= Object.fromEntries(Object.entries(updatedIndex).map(([participantsKey, id]) => [id, participantsKey]));
            const previousKey = keyByReportID[reportID];
            if (previousKey) {
                delete updatedIndex[previousKey];
                delete keyByReportID[reportID];
                keysToRefill.add(previousKey);
            }

            if (!nextKey || updatedIndex[nextKey] || keysToRefill.has(nextKey)) {
                continue;
            }
            updatedIndex[nextKey] = reportID;
            keyByReportID[reportID] = nextKey;
        }

        if (keysToRefill.size === 0) {
            return {reportIDs: updatedIndex, accountID: currentUserAccountID};
        }

        return {reportIDs: {...updatedIndex, ...buildIndex(reports, currentUserAccountID, keysToRefill)}, accountID: currentUserAccountID};
    },
});
