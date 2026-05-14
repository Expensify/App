import Onyx from 'react-native-onyx';
import EmojiReactionKeysToHexcode from '@libs/migrations/EmojiReactionKeysToHexcode';
import ONYXKEYS from '@src/ONYXKEYS';
import type ReportActionReactions from '@src/types/onyx/ReportActionReactions';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';
import wrapOnyxWithWaitForBatchedUpdates from '../../utils/wrapOnyxWithWaitForBatchedUpdates';

const REPORT_ACTION_ID = 'action1';

const THUMBSUP_NAME = '+1';
const THUMBSUP_COLON = ':+1:';
const THUMBSUP_HEX = '1F44D';
const JOY_HEX = '1F602';
const UNKNOWN_NAME = 'made_up';
const USER_ID_A = '12345';
const USER_ID_B = '67890';
const USER_ID_C = '123';
const USER_ID_D = '456';

const TIMESTAMP_JAN = '2024-01-01T00:00:00.000Z';
const TIMESTAMP_FEB = '2024-02-01T00:00:00.000Z';
const TIMESTAMP_MAR = '2024-03-01T00:00:00.000Z';

function makeUserReaction(id: string, timestamp: string) {
    return {
        id,
        skinTones: {[-1]: timestamp},
        oldestTimestamp: timestamp,
    };
}

function makeReaction(timestamp: string, userID: string) {
    return {
        createdAt: timestamp,
        oldestTimestamp: timestamp,
        users: {[userID]: makeUserReaction(userID, timestamp)},
    };
}

function getReactionsFromOnyx(reportActionID: string): Promise<ReportActionReactions | undefined> {
    return new Promise((resolve) => {
        const connection = Onyx.connect({
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS}${reportActionID}`,
            callback: (value) => {
                Onyx.disconnect(connection);
                resolve(value ?? undefined);
            },
        });
    });
}

describe('EmojiReactionKeysToHexcode', () => {
    beforeAll(() =>
        Onyx.init({
            keys: ONYXKEYS,
        }),
    );

    beforeEach(() => {
        wrapOnyxWithWaitForBatchedUpdates(Onyx);
        return waitForBatchedUpdates();
    });

    afterEach(() => Onyx.clear());

    it('renames a name-keyed reaction to its hexcode', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS}${REPORT_ACTION_ID}`, {
            [THUMBSUP_NAME]: makeReaction(TIMESTAMP_JAN, USER_ID_A),
        });

        await EmojiReactionKeysToHexcode();
        await waitForBatchedUpdates();

        const result = await getReactionsFromOnyx(REPORT_ACTION_ID);
        expect(result).toBeDefined();
        expect(result?.[THUMBSUP_HEX]).toBeDefined();
        expect(result?.[THUMBSUP_NAME]).toBeUndefined();
        expect(result?.[THUMBSUP_HEX]?.createdAt).toBe(TIMESTAMP_JAN);
        expect(result?.[THUMBSUP_HEX]?.users?.[USER_ID_A]).toBeDefined();
    });

    it('leaves hex-keyed reactions unchanged while renaming name-keyed ones', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS}${REPORT_ACTION_ID}`, {
            [THUMBSUP_NAME]: makeReaction(TIMESTAMP_JAN, USER_ID_A),
            [JOY_HEX]: makeReaction(TIMESTAMP_MAR, USER_ID_B),
        });

        await EmojiReactionKeysToHexcode();
        await waitForBatchedUpdates();

        const result = await getReactionsFromOnyx(REPORT_ACTION_ID);
        expect(result?.[THUMBSUP_HEX]).toBeDefined();
        expect(result?.[THUMBSUP_NAME]).toBeUndefined();
        expect(result?.[JOY_HEX]).toBeDefined();
    });

    it('merges colliding renames keeping the earliest createdAt and union of users', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS}${REPORT_ACTION_ID}`, {
            [THUMBSUP_NAME]: makeReaction(TIMESTAMP_JAN, USER_ID_C),
            [THUMBSUP_COLON]: makeReaction(TIMESTAMP_FEB, USER_ID_D),
        });

        await EmojiReactionKeysToHexcode();
        await waitForBatchedUpdates();

        const result = await getReactionsFromOnyx(REPORT_ACTION_ID);
        expect(result?.[THUMBSUP_HEX]).toBeDefined();
        expect(result?.[THUMBSUP_NAME]).toBeUndefined();
        expect(result?.[THUMBSUP_COLON]).toBeUndefined();
        expect(result?.[THUMBSUP_HEX]?.createdAt).toBe(TIMESTAMP_JAN);
        expect(result?.[THUMBSUP_HEX]?.users?.[USER_ID_C]).toBeDefined();
        expect(result?.[THUMBSUP_HEX]?.users?.[USER_ID_D]).toBeDefined();
    });

    it('preserves unknown emoji names unchanged', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS}${REPORT_ACTION_ID}`, {
            [UNKNOWN_NAME]: makeReaction(TIMESTAMP_JAN, USER_ID_A),
        });

        await EmojiReactionKeysToHexcode();
        await waitForBatchedUpdates();

        const result = await getReactionsFromOnyx(REPORT_ACTION_ID);
        expect(result?.[UNKNOWN_NAME]).toBeDefined();
    });

    it('is a no-op when no reaction data exists', async () => {
        await EmojiReactionKeysToHexcode();
        await waitForBatchedUpdates();

        const result = await getReactionsFromOnyx(REPORT_ACTION_ID);
        expect(result).toBeUndefined();
    });

    it('is a no-op when all reactions are already hex-keyed', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS}${REPORT_ACTION_ID}`, {
            [THUMBSUP_HEX]: makeReaction(TIMESTAMP_JAN, USER_ID_A),
        });

        await EmojiReactionKeysToHexcode();
        await waitForBatchedUpdates();

        const result = await getReactionsFromOnyx(REPORT_ACTION_ID);
        expect(result?.[THUMBSUP_HEX]).toBeDefined();
    });
});
