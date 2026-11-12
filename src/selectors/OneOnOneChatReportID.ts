import {getParticipantsChatKey, isOneOnOneChat, isSystemChat} from '@libs/ReportUtils';

import type {Report} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

/**
 * Looks up 1:1 and system chats by participant set. Answers are cached per report collection snapshot, so selector
 * runs between report writes skip the scan.
 */
const lookupCache = new WeakMap<NonNullable<OnyxCollection<Report>>, Map<string, string | undefined>>();

function isOneOnOneChatWithParticipants(report: Report, currentUserAccountID: number, participantsChatKey: string, participantAccountIDs: string[]): boolean {
    const participants = report.participants;
    if (!report.reportID || !participants) {
        return false;
    }
    for (const accountID of participantAccountIDs) {
        if (!(accountID in participants)) {
            return false;
        }
    }
    if (!isOneOnOneChat(report, currentUserAccountID) && !isSystemChat(report)) {
        return false;
    }
    return getParticipantsChatKey(Object.keys(participants).map(Number)) === participantsChatKey;
}

/**
 * Finds the 1:1 or system chat whose participants are exactly the ones in `participantsChatKey` (built with
 * `getParticipantsChatKey`). The first report in collection order wins, matching `getChatByParticipants`. Group chats
 * are left out because `getChatByParticipants` only returns those behind `shouldIncludeGroupChats`.
 *
 * Reports that miss one of the participants are skipped before the 1:1 checks run, and the answer is cached on the
 * collection snapshot, so re-renders without a report write cost a lookup.
 */
function getOneOnOneChatReportID(reports: OnyxCollection<Report>, currentUserAccountID: number | undefined, participantsChatKey: string): string | undefined {
    // Without the accountID every DM looks like a group chat.
    if (!reports || !currentUserAccountID) {
        return undefined;
    }

    let cachedLookups = lookupCache.get(reports);
    const cacheKey = `${currentUserAccountID}:${participantsChatKey}`;
    if (cachedLookups?.has(cacheKey)) {
        return cachedLookups.get(cacheKey);
    }

    const participantAccountIDs = participantsChatKey.split(',');
    let reportID: string | undefined;
    // for...in walks the frozen snapshot without copying thousands of reports into an array, which is most of the cost of a lookup on mount
    // eslint-disable-next-line guard-for-in
    for (const reportKey in reports) {
        const report = reports[reportKey];
        if (report && isOneOnOneChatWithParticipants(report, currentUserAccountID, participantsChatKey, participantAccountIDs)) {
            reportID = report.reportID;
            break;
        }
    }

    if (!cachedLookups) {
        cachedLookups = new Map();
        lookupCache.set(reports, cachedLookups);
    }
    cachedLookups.set(cacheKey, reportID);
    return reportID;
}

// eslint-disable-next-line import/prefer-default-export -- additional selectors may be added here
export {getOneOnOneChatReportID};
