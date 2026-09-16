import {getParticipantsChatKey, isOneOnOneChat, isSystemChat} from '@libs/ReportUtils';

import createOnyxDerivedValueConfig from '@userActions/OnyxDerived/createOnyxDerivedValueConfig';

import ONYXKEYS from '@src/ONYXKEYS';
import type {OneOnOneChatReportIDsDerivedValue} from '@src/types/onyx';
import type Report from '@src/types/onyx/Report';

import type {OnyxEntry} from 'react-native-onyx';

/** Lets a changed report find the entry it owned, without scanning. */
let participantsKeyByReportID: Record<string, string> = {};

/**
 * In index order, so deleting the winner promotes the next one instead of dropping the key. Optimistic chat creation
 * puts two reports on the same participants until the server report replaces the optimistic one, and the confirmation
 * page has to keep resolving a chat throughout.
 */
let reportIDsByParticipantsKey: Record<string, string[]> = {};

/** A different accountID changes what counts as a 1:1 chat, so the index has to be rebuilt. */
let indexedAccountID: number | undefined;

/**
 * Onyx can restore the derived value from disk while the maps above are still empty, and a delta applied on top of
 * that would never remove anything. That case has to rebuild.
 */
let hasBuiltIndex = false;

function clearIndexState() {
    participantsKeyByReportID = {};
    reportIDsByParticipantsKey = {};
    indexedAccountID = undefined;
    hasBuiltIndex = false;
}

function getIndexableParticipantsKey(report: OnyxEntry<Report>, currentUserAccountID: number | undefined): string | undefined {
    if (!report?.reportID || (!isOneOnOneChat(report, currentUserAccountID) && !isSystemChat(report))) {
        return undefined;
    }
    return getParticipantsChatKey(Object.keys(report.participants ?? {}).map(Number));
}

function trackReport(reportID: string, participantsKey: string): string {
    participantsKeyByReportID[reportID] = participantsKey;

    const matching = reportIDsByParticipantsKey[participantsKey] ?? [];
    if (!matching.includes(reportID)) {
        matching.push(reportID);
    }
    reportIDsByParticipantsKey[participantsKey] = matching;

    return matching.at(0) ?? reportID;
}

function untrackReport(reportID: string): {participantsKey: string; nextWinner: string | undefined} | undefined {
    const participantsKey = participantsKeyByReportID[reportID];
    if (!participantsKey) {
        return undefined;
    }

    delete participantsKeyByReportID[reportID];

    const remaining = (reportIDsByParticipantsKey[participantsKey] ?? []).filter((id) => id !== reportID);
    if (remaining.length === 0) {
        delete reportIDsByParticipantsKey[participantsKey];
        return {participantsKey, nextWinner: undefined};
    }

    reportIDsByParticipantsKey[participantsKey] = remaining;
    return {participantsKey, nextWinner: remaining.at(0)};
}

/**
 * Indexes 1:1 and system chats by participant set.
 *
 * Reports are keyed by reportID, so `getChatByParticipants` has to walk the whole collection to find a chat by its
 * participants. This index answers the same question with a lookup. Group chats are excluded because
 * `getChatByParticipants` only returns those behind `shouldIncludeGroupChats`.
 */
export default createOnyxDerivedValueConfig({
    key: ONYXKEYS.DERIVED.ONE_ON_ONE_CHAT_REPORT_IDS,
    // `isOneOnOneChat` needs the current accountID to tell a DM from a group chat, so SESSION has to be a
    // dependency. Without it the index gets built before the ID arrives and every two-participant DM is missing.
    dependencies: [ONYXKEYS.COLLECTION.REPORT, ONYXKEYS.SESSION],
    onReset: clearIndexState,
    compute: ([reports, session], {sourceValues, currentValue}) => {
        if (!reports) {
            clearIndexState();
            return {};
        }

        const currentUserAccountID = session?.accountID;
        const reportUpdates = sourceValues?.[ONYXKEYS.COLLECTION.REPORT];

        if (!hasBuiltIndex || !currentValue || currentUserAccountID !== indexedAccountID) {
            clearIndexState();
            indexedAccountID = currentUserAccountID;
            hasBuiltIndex = true;

            const rebuiltIndex: OneOnOneChatReportIDsDerivedValue = {};
            for (const report of Object.values(reports)) {
                const participantsKey = getIndexableParticipantsKey(report, currentUserAccountID);
                if (!participantsKey || !report?.reportID) {
                    continue;
                }
                rebuiltIndex[participantsKey] = trackReport(report.reportID, participantsKey);
            }
            return rebuiltIndex;
        }

        // Triggered by SESSION with the account unchanged, so the index still holds.
        if (!reportUpdates) {
            return currentValue;
        }

        const updatedIndex: OneOnOneChatReportIDsDerivedValue = {...currentValue};
        for (const reportKey of Object.keys(reportUpdates)) {
            const reportID = reportKey.slice(ONYXKEYS.COLLECTION.REPORT.length);
            // From the full collection, because a delta entry carries only the changed fields.
            const nextKey = getIndexableParticipantsKey(reports[reportKey], currentUserAccountID);

            if (nextKey === participantsKeyByReportID[reportID]) {
                continue;
            }

            const removed = untrackReport(reportID);
            if (removed?.nextWinner) {
                updatedIndex[removed.participantsKey] = removed.nextWinner;
            } else if (removed) {
                delete updatedIndex[removed.participantsKey];
            }

            if (!nextKey) {
                continue;
            }

            updatedIndex[nextKey] = trackReport(reportID, nextKey);
        }

        return updatedIndex;
    },
});
