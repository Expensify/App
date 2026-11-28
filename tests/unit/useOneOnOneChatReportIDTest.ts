import {act, renderHook} from '@testing-library/react-native';

import useOneOnOneChatReportID from '@hooks/useOneOnOneChatReportID';

import {buildParticipantsFromAccountIDs, getParticipantsChatKey} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const ME = 1;
const ALICE = 2;
const BOB = 3;

const aliceKey = getParticipantsChatKey([ME, ALICE]);

function chatWith(reportID: string, otherAccountID: number): Report {
    return {
        reportID,
        type: CONST.REPORT.TYPE.CHAT,
        participants: buildParticipantsFromAccountIDs([ME, otherAccountID]),
    };
}

async function writeReport(report: Report) {
    await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);
    await waitForBatchedUpdates();
}

describe('useOneOnOneChatReportID', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await Onyx.set(ONYXKEYS.SESSION, {accountID: ME});
        await waitForBatchedUpdates();
    });

    it('should return the chat with the given participants', async () => {
        // Given chats with Alice and Bob
        await writeReport(chatWith('10', ALICE));
        await writeReport(chatWith('20', BOB));

        // When the page looks up the chat with Alice
        const {result} = renderHook(() => useOneOnOneChatReportID(aliceKey));

        // Then it gets Alice's chat
        expect(result.current).toBe('10');
    });

    it('should return nothing without a participants key', async () => {
        // Given a chat with Alice
        await writeReport(chatWith('10', ALICE));

        // When the page is not sending to a single person, so it passes no key
        const {result} = renderHook(() => useOneOnOneChatReportID(undefined));

        // Then no chat is returned
        expect(result.current).toBeUndefined();
    });

    it('should keep the optimistic chat while the real one arrives, then follow the real one when the optimistic one is removed', async () => {
        // Given an optimistic chat with Alice and the page looking it up
        await writeReport(chatWith('optimistic-1', ALICE));
        const {result} = renderHook(() => useOneOnOneChatReportID(aliceKey));
        expect(result.current).toBe('optimistic-1');

        // When the server adds the real chat on the same participants
        await act(async () => {
            await writeReport(chatWith('30', ALICE));
        });

        // Then the optimistic chat is still the answer, as it was with the derived index
        expect(result.current).toBe('optimistic-1');

        // When the optimistic chat is removed
        await act(async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}optimistic-1`, null);
            await waitForBatchedUpdates();
        });

        // Then the real chat takes over instead of the lookup coming back empty
        expect(result.current).toBe('30');
    });

    it('should find a chat once the session arrives', async () => {
        // Given a chat with Alice and no accountID yet, as during sign in
        await Onyx.set(ONYXKEYS.SESSION, {});
        await writeReport(chatWith('10', ALICE));
        const {result} = renderHook(() => useOneOnOneChatReportID(aliceKey));
        expect(result.current).toBeUndefined();

        // When the session gets the accountID
        await act(async () => {
            await Onyx.merge(ONYXKEYS.SESSION, {accountID: ME});
            await waitForBatchedUpdates();
        });

        // Then the chat is found, because the lookup reads the accountID from the session
        expect(result.current).toBe('10');
    });
});
