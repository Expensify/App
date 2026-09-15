import {getParticipantsChatKey, isOneOnOneChat, isSystemChat} from '@libs/ReportUtils';

import createOnyxDerivedValueConfig from '@userActions/OnyxDerived/createOnyxDerivedValueConfig';

import ONYXKEYS from '@src/ONYXKEYS';
import type {OneOnOneChatReportIDsDerivedValue} from '@src/types/onyx';

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
    compute: ([reports, session]) => {
        if (!reports) {
            return {};
        }

        const currentUserAccountID = session?.accountID;
        const oneOnOneChatReportIDs: OneOnOneChatReportIDsDerivedValue = {};

        for (const report of Object.values(reports)) {
            if (!report?.reportID || (!isOneOnOneChat(report, currentUserAccountID) && !isSystemChat(report))) {
                continue;
            }

            const participantsKey = getParticipantsChatKey(Object.keys(report.participants ?? {}).map(Number));

            // First write wins, matching the `.find()` in `getChatByParticipants` over this same collection.
            if (participantsKey in oneOnOneChatReportIDs) {
                continue;
            }

            oneOnOneChatReportIDs[participantsKey] = report.reportID;
        }

        return oneOnOneChatReportIDs;
    },
});
