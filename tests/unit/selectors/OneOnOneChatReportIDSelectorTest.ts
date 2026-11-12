import {buildParticipantsFromAccountIDs, getParticipantsChatKey} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

import {getOneOnOneChatReportID} from '@selectors/OneOnOneChatReportID';

const ME = 1;
const ALICE = 2;
const BOB = 3;

function chatWith(reportID: string, otherAccountID: number): Report {
    return {
        reportID,
        type: CONST.REPORT.TYPE.CHAT,
        participants: buildParticipantsFromAccountIDs([ME, otherAccountID]),
    };
}

function collection(...reports: Report[]): OnyxCollection<Report> {
    return Object.fromEntries(reports.map((report) => [`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report]));
}

const aliceKey = getParticipantsChatKey([ME, ALICE]);
const bobKey = getParticipantsChatKey([ME, BOB]);

describe('getOneOnOneChatReportID', () => {
    it('should find each 1:1 chat by its participants', () => {
        // Given a chat with Alice and a chat with Bob
        const reports = collection(chatWith('10', ALICE), chatWith('20', BOB));

        // When each chat is looked up by its participants
        const aliceChatID = getOneOnOneChatReportID(reports, ME, aliceKey);
        const bobChatID = getOneOnOneChatReportID(reports, ME, bobKey);

        // Then each lookup gets its own chat
        expect(aliceChatID).toBe('10');
        expect(bobChatID).toBe('20');
    });

    it('should leave out group chats and rooms', () => {
        // Given a group chat with Alice and Bob, and a room with only Alice
        const groupChat: Report = {reportID: '10', type: CONST.REPORT.TYPE.CHAT, participants: buildParticipantsFromAccountIDs([ME, ALICE, BOB])};
        const room: Report = {...chatWith('20', ALICE), chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM};

        // When the chat with Alice is looked up
        const reportID = getOneOnOneChatReportID(collection(groupChat, room), ME, aliceKey);

        // Then neither is returned, because getChatByParticipants never returns them for a 1:1 lookup
        expect(reportID).toBeUndefined();
    });

    it('should find a system chat only when its participants match exactly', () => {
        // Given a system chat with Alice and Bob, followed by a system chat with only Alice
        const systemChatWithBoth: Report = {
            reportID: '10',
            type: CONST.REPORT.TYPE.CHAT,
            chatType: CONST.REPORT.CHAT_TYPE.SYSTEM,
            participants: buildParticipantsFromAccountIDs([ME, ALICE, BOB]),
        };
        const systemChatWithAlice: Report = {...chatWith('20', ALICE), chatType: CONST.REPORT.CHAT_TYPE.SYSTEM};

        // When the chat with Alice is looked up
        const reportID = getOneOnOneChatReportID(collection(systemChatWithBoth, systemChatWithAlice), ME, aliceKey);

        // Then the system chat with only Alice is returned, because a system chat skips the 1:1 check and has to match on its whole participant set
        expect(reportID).toBe('20');
    });

    it('should find a chat added by a later write', () => {
        // Given a lookup for Bob's chat that found nothing
        expect(getOneOnOneChatReportID(collection(chatWith('10', ALICE)), ME, bobKey)).toBeUndefined();

        // When a write adds Bob's chat, which gives a new collection snapshot
        const reportID = getOneOnOneChatReportID(collection(chatWith('10', ALICE), chatWith('20', BOB)), ME, bobKey);

        // Then the new snapshot is searched again and Bob's chat is found
        expect(reportID).toBe('20');
    });

    it('should stop finding a chat that was deleted', () => {
        // Given a lookup that found Bob's chat
        const aliceChat = chatWith('10', ALICE);
        expect(getOneOnOneChatReportID(collection(aliceChat, chatWith('20', BOB)), ME, bobKey)).toBe('20');

        // When Bob's chat is deleted
        const reportID = getOneOnOneChatReportID(collection(aliceChat), ME, bobKey);

        // Then nothing is found
        expect(reportID).toBeUndefined();
    });

    it('should follow a chat whose participants changed', () => {
        // Given a chat with Alice
        expect(getOneOnOneChatReportID(collection(chatWith('10', ALICE)), ME, aliceKey)).toBe('10');

        // When the same report now has Bob as participant
        const reports = collection(chatWith('10', BOB));

        // Then it is found under Bob only, so a stale lookup never points at it
        expect(getOneOnOneChatReportID(reports, ME, aliceKey)).toBeUndefined();
        expect(getOneOnOneChatReportID(reports, ME, bobKey)).toBe('10');
    });

    it('should keep the first chat in collection order when two share a participant set', () => {
        // Given two chats with Alice
        const firstChat = chatWith('20', ALICE);

        // When the chat with Alice is looked up, and again after the second chat goes away
        const withBoth = getOneOnOneChatReportID(collection(firstChat, chatWith('10', ALICE)), ME, aliceKey);
        const withFirstOnly = getOneOnOneChatReportID(collection(firstChat), ME, aliceKey);

        // Then the first one in collection order wins both times, as in getChatByParticipants
        expect(withBoth).toBe('20');
        expect(withFirstOnly).toBe('20');
    });

    it('should keep the optimistic chat while the real one arrives, then switch to the real one when the optimistic one is removed', () => {
        // Given an optimistic chat with Alice, as created before the server answers
        const optimisticChat = chatWith('optimistic-1', ALICE);
        const afterOptimistic = getOneOnOneChatReportID(collection(optimisticChat), ME, aliceKey);

        // When the server adds the real chat on the same participants, and then removes the optimistic one
        const afterServerReport = getOneOnOneChatReportID(collection(optimisticChat, chatWith('30', ALICE)), ME, aliceKey);
        const afterCleanup = getOneOnOneChatReportID(collection(chatWith('30', ALICE)), ME, aliceKey);

        // Then the optimistic chat stays for the moment both exist, and the real one takes over instead of the lookup coming back empty
        expect(afterOptimistic).toBe('optimistic-1');
        expect(afterServerReport).toBe('optimistic-1');
        expect(afterCleanup).toBe('30');
    });

    it('should not search the same collection twice for the same participants', () => {
        // Given a collection that counts how often its report is read, and a first lookup over it
        let reportReads = 0;
        const aliceChat = chatWith('10', ALICE);
        const reports: OnyxCollection<Report> = {};
        Object.defineProperty(reports, `${ONYXKEYS.COLLECTION.REPORT}10`, {
            enumerable: true,
            get: () => {
                reportReads++;
                return aliceChat;
            },
        });
        expect(getOneOnOneChatReportID(reports, ME, aliceKey)).toBe('10');
        const readsAfterFirstLookup = reportReads;

        // When the page looks up the same chat again without a report write, for example on a re-render or a SESSION token refresh
        const reportID = getOneOnOneChatReportID(reports, ME, aliceKey);

        // Then the cached answer comes back without reading the collection again
        expect(reportID).toBe('10');
        expect(reportReads).toBe(readsAfterFirstLookup);
    });

    it('should search again for a different account, because that changes what counts as a 1:1 chat', () => {
        // Given a lookup for the current user that found Alice's chat
        const reports = collection(chatWith('10', ALICE));
        expect(getOneOnOneChatReportID(reports, ME, aliceKey)).toBe('10');

        // When the same reports are searched for an account that is in none of them
        const reportID = getOneOnOneChatReportID(reports, 99, aliceKey);

        // Then the chat has two other participants for that account, so it is not a 1:1 chat
        expect(reportID).toBeUndefined();
    });

    it('should find nothing until the current account ID is known', () => {
        // Given a chat with Alice and no session yet
        const reports = collection(chatWith('10', ALICE));

        // When the chat is looked up without an accountID
        const reportID = getOneOnOneChatReportID(reports, undefined, aliceKey);

        // Then nothing is found, because without the accountID every DM looks like a group chat
        expect(reportID).toBeUndefined();
    });
});
